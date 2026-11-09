<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketType extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'description',
        'price',
        'quota',
        'sale_ends_at',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'quota' => 'integer',
            'sale_ends_at' => 'date',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(Attendee::class);
    }
}
