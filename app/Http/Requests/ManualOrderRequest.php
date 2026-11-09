<?php

namespace App\Http\Requests;

use App\Services\OrderService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// transaksi manual / on-site dari dashboard admin
class ManualOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'ev' => ['required', 'string', 'exists:events,slug'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.t' => ['required'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'attendees' => ['required', 'array', 'min:1'],
            'attendees.*.n' => ['required', 'string', 'max:255'],
            'attendees.*.t' => ['required'],
            'promo' => ['nullable', 'string', 'max:50'],
            'pay' => ['required', Rule::in(OrderService::ADMIN_PAYMENTS)],
            'status' => ['required', Rule::in(['paid', 'pending'])],
        ];
    }
}
