<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// checkout tiket dari situs publik
class CheckoutRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'ev' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.t' => ['required'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'attendees' => ['required', 'array', 'min:1'],
            'attendees.*.n' => ['required', 'string', 'max:255'],
            'attendees.*.t' => ['required'],
            'promo' => ['nullable', 'string', 'max:50'],
            'pay' => ['nullable', 'string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'attendees.*.n.required' => 'Nama setiap peserta wajib diisi',
        ];
    }
}
