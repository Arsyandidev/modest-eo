<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PromoType;
use App\Models\Event;
use App\Models\Promo;
use Illuminate\Validation\ValidationException;

class PromoService
{
    /**
     * Cari & validasi kode promo untuk sebuah event.
     *
     * @throws ValidationException
     */
    public function check(string $code, Event $event): Promo
    {
        $promo = Promo::where('code', strtoupper(trim($code)))->first();

        $error = match (true) {
            ! $promo => 'Kode promo tidak ditemukan',
            ! $promo->is_active => 'Kode promo sedang tidak aktif',
            $promo->valid_until && $promo->valid_until->lt(today()) => 'Kode promo sudah kedaluwarsa',
            $promo->event_id && $promo->event_id !== $event->id => 'Kode promo tidak berlaku untuk event ini',
            $this->used($promo) >= $promo->quota => 'Kuota kode promo sudah habis',
            default => null,
        };

        if ($error) {
            throw ValidationException::withMessages(['promo' => $error]);
        }

        return $promo;
    }

    public function used(Promo $promo): int
    {
        return $promo->orders()->where('status', '!=', OrderStatus::Cancelled)->count();
    }

    public function discount(?Promo $promo, int $subtotal): int
    {
        if (! $promo) {
            return 0;
        }

        $value = $promo->type === PromoType::Percent
            ? (int) round($subtotal * $promo->value / 100)
            : $promo->value;

        return min($subtotal, $value);
    }
}
