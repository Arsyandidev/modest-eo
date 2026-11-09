<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\AttendeeResource;
use App\Models\Attendee;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AttendeeController extends Controller
{
    public function checkIn(Request $request, Attendee $attendee): AttendeeResource
    {
        if ($attendee->order->status !== OrderStatus::Paid) {
            throw ValidationException::withMessages(['ticket' => "Tiket tidak berlaku (status pesanan: {$attendee->order->status->label()})"]);
        }

        if ($attendee->checked_in_at) {
            throw ValidationException::withMessages(['ticket' => "{$attendee->name} sudah check-in pukul {$attendee->checked_in_at->format('H.i')}"]);
        }

        $attendee->update(['checked_in_at' => now(), 'checked_in_by' => $request->user()->id]);

        return AttendeeResource::make($attendee);
    }

    public function undo(Attendee $attendee): AttendeeResource
    {
        $attendee->update(['checked_in_at' => null, 'checked_in_by' => null]);

        return AttendeeResource::make($attendee);
    }
}
