<?php

namespace App\Models;

use App\Enums\EventCategory;
use App\Enums\EventStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'category',
        'excerpt',
        'description',
        'banner',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'venue',
        'city',
        'address',
        'status',
        'is_featured',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'category' => EventCategory::class,
            'status' => EventStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'is_featured' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // contoh: "10.00 – 21.00 WIB"
    public function timeLabel(): string
    {
        if (! $this->start_time) {
            return '';
        }

        $fmt = fn (string $t) => str_replace(':', '.', substr($t, 0, 5));

        return $fmt($this->start_time).($this->end_time ? ' – '.$fmt($this->end_time) : '').' WIB';
    }

    public function hasEnded(): bool
    {
        return $this->end_date->lt(today());
    }

    public function ticketTypes(): HasMany
    {
        return $this->hasMany(TicketType::class)->orderBy('sort_order');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class)->orderBy('sort_order');
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(EventSpeaker::class)->orderBy('sort_order');
    }

    public function promos(): HasMany
    {
        return $this->hasMany(Promo::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(Attendee::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished(Builder $query): void
    {
        $query->where('status', EventStatus::Published);
    }

    public function scopeUpcoming(Builder $query): void
    {
        $query->whereDate('end_date', '>=', today());
    }

    public function scopeEnded(Builder $query): void
    {
        $query->whereDate('end_date', '<', today());
    }
}
