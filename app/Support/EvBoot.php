<?php

namespace App\Support;

use App\Enums\OrderStatus;
use App\Http\Resources\EventResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\PromoResource;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Promo;
use Illuminate\Support\Collection;

/**
 * Data awal untuk JS mockup (window.EV_BOOT), menggantikan localStorage.
 */
class EvBoot
{
    // dashboard admin: semua data
    public static function admin(): array
    {
        return [
            'scope' => 'admin',
            'events' => EventResource::collection(
                Event::with(['ticketTypes', 'sessions', 'speakers'])->orderByDesc('start_date')->get()
            )->resolve(),
            'orders' => OrderResource::collection(
                Order::with(['event:id,slug', 'items', 'attendees'])->orderByDesc('created_at')->orderByDesc('id')->get()
            )->resolve(),
            'promos' => PromoResource::collection(Promo::with('event:id,slug')->latest('id')->get())->resolve(),
        ];
    }

    // situs publik: hanya event terbit + jumlah tiket terjual, tanpa data pembeli
    public static function public(): array
    {
        return [
            'scope' => 'public',
            'events' => self::publicEvents(Event::published()->with(['ticketTypes', 'sessions', 'speakers'])->get()),
            'orders' => [],
            'promos' => [],
        ];
    }

    public static function publicEvent(int $eventId): array
    {
        return self::publicEvents(Event::with(['ticketTypes', 'sessions', 'speakers'])->whereKey($eventId)->get())[0];
    }

    private static function publicEvents(Collection $events): array
    {
        $ids = $events->pluck('id');

        $sold = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereIn('status', [OrderStatus::Pending, OrderStatus::Paid])->whereIn('event_id', $ids))
            ->selectRaw('ticket_type_id, SUM(quantity) as qty')
            ->groupBy('ticket_type_id')
            ->pluck('qty', 'ticket_type_id');

        $attendees = Attendee::query()
            ->whereIn('event_id', $ids)
            ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::Paid))
            ->selectRaw('event_id, COUNT(*) as n')
            ->groupBy('event_id')
            ->pluck('n', 'event_id');

        return $events->map(function (Event $event) use ($sold, $attendees) {
            $data = EventResource::make($event)->resolve();
            $data['tickets'] = array_map(fn ($t) => $t + ['sold' => (int) ($sold[$t['id']] ?? 0)], $data['tickets']);
            $data['attendeeCount'] = (int) ($attendees[$event->id] ?? 0);

            return $data;
        })->all();
    }
}
