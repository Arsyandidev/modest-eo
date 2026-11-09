<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu Pembayaran',
            self::Paid => 'Lunas',
            self::Cancelled => 'Dibatalkan',
            self::Refunded => 'Refund',
        };
    }

    // status yang memakan kuota tiket
    public function holdsQuota(): bool
    {
        return in_array($this, [self::Pending, self::Paid], true);
    }
}
