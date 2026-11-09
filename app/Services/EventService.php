<?php

namespace App\Services;

use App\Enums\EventCategory;
use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EventService
{
    public function __construct(private OrderService $orders) {}

    /**
     * Simpan event baru / perubahan event beserta tiket, rundown & pembicara.
     * $data mengikuti payload editor event di admin.js.
     *
     * @throws ValidationException
     */
    public function save(?Event $event, array $data, User $by): Event
    {
        return DB::transaction(function () use ($event, $data, $by) {
            $event ??= new Event([
                'slug' => $this->uniqueSlug($data['title']),
                'created_by' => $by->id,
            ]);

            $event->fill([
                'title' => $data['title'],
                'category' => EventCategory::fromLabel($data['cat']),
                'excerpt' => $data['excerpt'] ?? null,
                'description' => $data['desc'] ?? null,
                'banner' => $data['img'] ?? null,
                'start_date' => $data['start'],
                'end_date' => $data['end'],
                'start_time' => $data['start_time'] ?? null,
                'end_time' => $data['end_time'] ?? null,
                'venue' => $data['venue'],
                'city' => $data['city'],
                'address' => $data['address'] ?? null,
                'status' => $data['status'],
                'is_featured' => (bool) ($data['featured'] ?? false),
            ])->save();

            // hanya boleh ada satu event unggulan
            if ($event->is_featured) {
                Event::whereKeyNot($event->id)->update(['is_featured' => false]);
            }

            $this->syncTickets($event, $data['tickets']);

            $event->sessions()->delete();
            foreach (array_values($data['rundown'] ?? []) as $i => [$time, $title, $desc]) {
                $event->sessions()->create(['time' => (string) $time, 'title' => $title, 'description' => $desc ?: null, 'sort_order' => $i]);
            }

            $event->speakers()->delete();
            foreach (array_values($data['speakers'] ?? []) as $i => $s) {
                $event->speakers()->create(['name' => $s['name'], 'role' => $s['role'] ?? null, 'sort_order' => $i]);
            }

            return $this->fresh($event);
        });
    }

    public function duplicate(Event $source, User $by): Event
    {
        return DB::transaction(function () use ($source, $by) {
            $copy = $source->replicate(['slug', 'status', 'is_featured', 'created_by']);
            $copy->fill([
                'slug' => $this->uniqueSlug($source->slug.'-salinan'),
                'title' => $source->title.' (Salinan)',
                'status' => EventStatus::Draft,
                'is_featured' => false,
                'created_by' => $by->id,
            ])->save();

            foreach (['ticketTypes', 'sessions', 'speakers'] as $relation) {
                foreach ($source->{$relation} as $row) {
                    $copy->{$relation}()->save($row->replicate(['event_id']));
                }
            }

            return $this->fresh($copy);
        });
    }

    /**
     * @throws ValidationException
     */
    public function delete(Event $event): void
    {
        if ($event->orders()->exists()) {
            throw ValidationException::withMessages(['event' => 'Event sudah memiliki transaksi, jadikan draft saja']);
        }

        $event->delete();
    }

    public function fresh(Event $event): Event
    {
        return $event->fresh(['ticketTypes', 'sessions', 'speakers']);
    }

    private function syncTickets(Event $event, array $tickets): void
    {
        $keep = [];

        foreach (array_values($tickets) as $i => $t) {
            $existing = ctype_digit((string) ($t['id'] ?? '')) ? $event->ticketTypes()->find($t['id']) : null;
            $ticket = $existing ?? $event->ticketTypes()->make();

            if ($existing && $t['quota'] < ($sold = $this->orders->sold($existing))) {
                throw ValidationException::withMessages(['tickets' => "Kuota {$existing->name} tidak boleh kurang dari {$sold} tiket terjual"]);
            }

            $ticket->fill([
                'name' => $t['name'],
                'description' => $t['desc'] ?? null,
                'price' => $t['price'],
                'quota' => $t['quota'],
                'sale_ends_at' => $t['saleEnd'] ?: null,
                'sort_order' => $i,
            ])->save();

            $keep[] = $ticket->id;
        }

        foreach ($event->ticketTypes()->whereNotIn('id', $keep)->get() as $removed) {
            if ($removed->orderItems()->exists()) {
                throw ValidationException::withMessages(['tickets' => "Tiket {$removed->name} sudah terjual dan tidak bisa dihapus"]);
            }
            $removed->delete();
        }
    }

    private function uniqueSlug(string $base): string
    {
        $base = Str::limit(Str::slug($base), 48, '') ?: 'event';
        $slug = $base;

        for ($i = 2; Event::where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
