<?php

namespace App\Models;

use App\Enums\PromoType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promo extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'quota',
        'event_id',
        'valid_until',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => PromoType::class,
            'value' => 'integer',
            'quota' => 'integer',
            'valid_until' => 'date',
            'is_active' => 'boolean',
        ];
    }

    // null = berlaku untuk semua event
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
