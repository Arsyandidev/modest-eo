<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// satu baris rundown acara
class EventSession extends Model
{
    protected $fillable = [
        'event_id',
        'time',
        'title',
        'description',
        'sort_order',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
