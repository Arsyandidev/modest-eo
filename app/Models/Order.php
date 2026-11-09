<?php

namespace App\Models;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'invoice_number',
        'access_token',
        'event_id',
        'buyer_name',
        'buyer_email',
        'buyer_phone',
        'promo_id',
        'promo_code',
        'subtotal',
        'discount',
        'service_fee',
        'total',
        'payment_method',
        'status',
        'source',
        'created_by',
        'expires_at',
        'paid_at',
        'cancelled_at',
        'refunded_at',
        'refund_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'source' => OrderSource::class,
            'subtotal' => 'integer',
            'discount' => 'integer',
            'service_fee' => 'integer',
            'total' => 'integer',
            'expires_at' => 'datetime',
            'paid_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    protected $hidden = [
        'access_token',
    ];

    public function getRouteKeyName(): string
    {
        return 'invoice_number';
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function promo(): BelongsTo
    {
        return $this->belongsTo(Promo::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(Attendee::class);
    }

    // admin yang membuat transaksi manual
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
