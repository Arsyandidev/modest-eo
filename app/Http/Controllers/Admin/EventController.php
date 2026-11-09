<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    public function __construct(private EventService $events) {}

    public function store(SaveEventRequest $request): EventResource
    {
        return EventResource::make($this->events->save(null, $request->validated(), $request->user()));
    }

    public function update(SaveEventRequest $request, Event $event): EventResource
    {
        return EventResource::make($this->events->save($event, $request->validated(), $request->user()));
    }

    // dipakai tombol "Jadikan Draft" untuk event yang sudah bertransaksi
    public function status(Request $request, Event $event): EventResource
    {
        $event->update($request->validate(['status' => ['required', Rule::in(['draft', 'published'])]]));

        return EventResource::make($this->events->fresh($event));
    }

    public function duplicate(Request $request, Event $event): EventResource
    {
        return EventResource::make($this->events->duplicate($event, $request->user()));
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->events->delete($event);

        return response()->json(['ok' => true]);
    }
}
