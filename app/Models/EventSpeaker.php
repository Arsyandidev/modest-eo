<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventSpeaker extends Model
{
    protected $fillable = [
        'event_id',
        'name',
        'role',
        'photo',
        'sort_order',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
