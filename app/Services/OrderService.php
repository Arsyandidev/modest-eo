<?php

namespace App\Services;

use App\Enums\EventStatus;
use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\TicketType;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public const SERVICE_FEE = 5000;

    public const MAX_PER_TICKET = 5; // batas per jenis tiket untuk pembelian via situs

    public const WEB_PAYMENTS = ['VA BCA', 'VA Mandiri', 'QRIS', 'GoPay', 'Kartu Kredit'];

    public const ADMIN_PAYMENTS = ['Tunai', 'EDC / Debit', 'QRIS', 'Transfer Bank', 'Komplimen'];

    public function __construct(private PromoService $promos) {}

    /**
     * Buat pesanan baru (checkout situs maupun transaksi manual admin).
     *
     * $data: name, email, phone, items[{t, qty}], attendees[{n, t}], promo, pay, status (khusus admin)
     *
     * @throws ValidationException
     */
    public function create(Event $event, array $data, OrderSource $source, ?User $by = null): Order
    {
        return DB::transaction(function () use ($event, $data, $source, $by) {
            $this->fail($event->status !== EventStatus::Published || $event->hasEnded(), 'ev', 'Event tidak tersedia untuk pembelian');

            $tickets = $event->ticketTypes()->lockForUpdate()->get()->keyBy('id');
            $items = collect($data['items'])->filter(fn ($i) => $i['qty'] > 0);
            $this->fail($items->isEmpty(), 'items', 'Pilih minimal satu tiket');

            $subtotal = 0;
            foreach ($items as $item) {
                $ticket = $tickets->get((int) $item['t']);
                $this->fail(! $ticket, 'items', 'Jenis tiket tidak valid');
                $this->fail($source === OrderSource::Web && $item['qty'] > self::MAX_PER_TICKET, 'items', 'Maksimal '.self::MAX_PER_TICKET." tiket {$ticket->name} per pesanan");
                $this->fail($ticket->sale_ends_at && $ticket->sale_ends_at->lt(today()), 'items', "Penjualan {$ticket->name} sudah ditutup");

                $left = $ticket->quota - $this->sold($ticket);
                $this->fail($item['qty'] > $left, 'items', $left > 0 ? "{$ticket->name} tersisa {$left} tiket" : "{$ticket->name} habis terjual");

                $subtotal += $ticket->price * $item['qty'];
            }

            // jumlah nama peserta harus sama dengan jumlah tiket per jenis
            $attendees = collect($data['attendees']);
            foreach ($items as $item) {
                $count = $attendees->where('t', (string) $item['t'])->count();
                $this->fail($count !== (int) $item['qty'], 'attendees', 'Data peserta tidak lengkap');
            }

            // diskon: komplimen (admin) atau kode promo
            $promo = null;
            $promoCode = null;
            if ($source === OrderSource::Admin && ($data['pay'] ?? '') === 'Komplimen') {
                $discount = $subtotal;
                $promoCode = 'KOMPLIMEN';
            } else {
                if (! empty($data['promo'])) {
                    $promo = $this->promos->check($data['promo'], $event);
                    $promoCode = $promo->code;
                }
                $discount = $this->promos->discount($promo, $subtotal);
            }

            $payable = $subtotal - $discount;
            $fee = $source === OrderSource::Web && $payable > 0 ? self::SERVICE_FEE : 0;
            $total = $payable + $fee;

            if ($source === OrderSource::Web) {
                $status = $total > 0 ? OrderStatus::Pending : OrderStatus::Paid;
                $pay = $total > 0 ? ($data['pay'] ?? '') : 'Gratis';
                $this->fail($total > 0 && ! in_array($pay, self::WEB_PAYMENTS, true), 'pay', 'Metode pembayaran tidak valid');
            } else {
                $status = OrderStatus::from($data['status'] ?? 'paid');
                $pay = $data['pay'];
            }

            $order = Order::create([
                'invoice_number' => $this->nextInvoice(),
                'access_token' => Str::random(40),
                'event_id' => $event->id,
                'buyer_name' => $data['name'],
                'buyer_email' => $data['email'] ?? null,
                'buyer_phone' => $data['phone'] ?? null,
                'promo_id' => $promo?->id,
                'promo_code' => $promoCode,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'service_fee' => $fee,
                'total' => $total,
                'payment_method' => $pay,
                'status' => $status,
                'source' => $source,
                'created_by' => $by?->id,
                'expires_at' => $status === OrderStatus::Pending ? now()->addDay() : null,
                'paid_at' => $status === OrderStatus::Paid ? now() : null,
            ]);

            foreach ($items as $item) {
                $ticket = $tickets->get((int) $item['t']);
                $orderItem = $order->items()->create([
                    'ticket_type_id' => $ticket->id,
                    'ticket_name' => $ticket->name,
                    'unit_price' => $ticket->price,
                    'quantity' => $item['qty'],
                ]);

                foreach ($attendees->where('t', (string) $item['t']) as $att) {
                    $orderItem->attendees()->create([
                        'order_id' => $order->id,
                        'ticket_type_id' => $ticket->id,
                        'event_id' => $event->id,
                        'ticket_code' => $this->ticketCode(),
                        'name' => trim($att['n']),
                    ]);
                }
            }

            return $order->load(['event:id,slug', 'items', 'attendees']);
        });
    }

    /**
     * Ubah status pesanan: pending → paid/cancelled, paid → refunded.
     *
     * @throws ValidationException
     */
    public function transition(Order $order, OrderStatus $to, ?string $note = null): Order
    {
        $allowed = match ($order->status) {
            OrderStatus::Pending => [OrderStatus::Paid, OrderStatus::Cancelled],
            OrderStatus::Paid => $order->total > 0 ? [OrderStatus::Refunded] : [],
            default => [],
        };

        $this->fail(! in_array($to, $allowed, true), 'status', "Pesanan {$order->status->label()} tidak bisa diubah menjadi {$to->label()}");

        $order->status = $to;
        match ($to) {
            OrderStatus::Paid => $order->paid_at = now(),
            OrderStatus::Cancelled => $order->cancelled_at = now(),
            OrderStatus::Refunded => [$order->refunded_at = now(), $order->refund_reason = $note],
            default => null,
        };
        $order->save();

        return $order->load(['event:id,slug', 'items', 'attendees']);
    }

    // tiket terpakai = pesanan pending + lunas
    public function sold(TicketType $ticket): int
    {
        return (int) OrderItem::where('ticket_type_id', $ticket->id)
            ->whereHas('order', fn ($q) => $q->whereIn('status', [OrderStatus::Pending, OrderStatus::Paid]))
            ->sum('quantity');
    }

    private function nextInvoice(): string
    {
        $next = (Order::max('id') ?? 0) + 1;

        return 'INV-'.now()->format('ym').'-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    private function ticketCode(): string
    {
        do {
            $code = 'MDS-'.collect(range(1, 6))->map(fn () => '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'[random_int(0, 31)])->join('');
        } while (Attendee::where('ticket_code', $code)->exists());

        return $code;
    }

    private function fail(bool $condition, string $key, string $message): void
    {
        if ($condition) {
            throw ValidationException::withMessages([$key => $message]);
        }
    }
}
