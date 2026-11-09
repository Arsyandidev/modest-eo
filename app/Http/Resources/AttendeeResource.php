<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Attendee
 */
class AttendeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'c' => $this->ticket_code,
            'n' => $this->name,
            't' => (string) $this->ticket_type_id,
            'in' => $this->checked_in_at?->toIso8601String(),
        ];
    }
}
