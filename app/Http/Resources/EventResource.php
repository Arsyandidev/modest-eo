<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Bentuk data event mengikuti struktur yang dipakai JS mockup (events-data.js).
 *
 * @mixin \App\Models\Event
 */
class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'title' => $this->title,
            'cat' => $this->category->label(),
            'excerpt' => (string) $this->excerpt,
            'desc' => (string) $this->description,
            'img' => (string) $this->banner,
            'start' => $this->start_date->toDateString(),
            'end' => $this->end_date->toDateString(),
            'start_time' => $this->start_time ? substr($this->start_time, 0, 5) : '',
            'end_time' => $this->end_time ? substr($this->end_time, 0, 5) : '',
            'time' => $this->timeLabel(),
            'venue' => $this->venue,
            'city' => $this->city,
            'address' => (string) $this->address,
            'status' => $this->status->value,
            'featured' => $this->is_featured,
            'created' => $this->created_at?->toDateString(),
            'rundown' => $this->sessions->map(fn ($s) => [$s->time, $s->title, (string) $s->description])->all(),
            'speakers' => $this->speakers->map(fn ($s) => ['name' => $s->name, 'role' => (string) $s->role])->all(),
            'tickets' => $this->ticketTypes->map(fn ($t) => [
                'id' => (string) $t->id,
                'name' => $t->name,
                'price' => $t->price,
                'quota' => $t->quota,
                'saleEnd' => $t->sale_ends_at?->toDateString() ?? '',
                'desc' => (string) $t->description,
            ])->all(),
        ];
    }
}
