<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Order
 */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->invoice_number,
            'ev' => $this->event->slug,
            'name' => $this->buyer_name,
            'email' => (string) $this->buyer_email,
            'phone' => (string) $this->buyer_phone,
            'items' => $this->items->map(fn ($i) => ['t' => (string) $i->ticket_type_id, 'qty' => $i->quantity, 'price' => $i->unit_price])->all(),
            'promo' => (string) $this->promo_code,
            'disc' => $this->discount,
            'fee' => $this->service_fee,
            'total' => $this->total,
            'pay' => $this->payment_method,
            'status' => $this->status->value,
            'src' => $this->source->value,
            'at' => $this->created_at->toIso8601String(),
            'paidAt' => $this->paid_at?->toIso8601String(),
            'cancelledAt' => $this->cancelled_at?->toIso8601String(),
            'refundedAt' => $this->refunded_at?->toIso8601String(),
            'note' => (string) $this->refund_reason,
            'att' => $this->attendees->map(fn ($a) => AttendeeResource::make($a)->resolve())->all(),
        ];
    }
}
