<?php

namespace App\Http\Requests;

use App\Enums\EventCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'cat' => ['required', Rule::in(EventCategory::labels())],
            'excerpt' => ['nullable', 'string', 'max:180'],
            'desc' => ['nullable', 'string'],
            'img' => ['nullable', 'string', 'max:255'],
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'venue' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published'])],
            'featured' => ['boolean'],

            'tickets' => ['required', 'array', 'min:1'],
            'tickets.*.id' => ['nullable'],
            'tickets.*.name' => ['required', 'string', 'max:255'],
            'tickets.*.price' => ['required', 'integer', 'min:0'],
            'tickets.*.quota' => ['required', 'integer', 'min:1'],
            'tickets.*.saleEnd' => ['nullable', 'date'],
            'tickets.*.desc' => ['nullable', 'string', 'max:255'],

            'rundown' => ['array'],
            'rundown.*' => ['array', 'size:3'],
            'rundown.*.0' => ['nullable', 'string', 'max:20'],
            'rundown.*.1' => ['required', 'string', 'max:255'],
            'rundown.*.2' => ['nullable', 'string', 'max:255'],

            'speakers' => ['array'],
            'speakers.*.name' => ['required', 'string', 'max:255'],
            'speakers.*.role' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul event wajib diisi',
            'end.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai',
            'venue.required' => 'Nama venue wajib diisi',
            'tickets.required' => 'Minimal satu jenis tiket',
            'tickets.*.name.required' => 'Nama setiap tiket wajib diisi',
            'tickets.*.quota.min' => 'Kuota tiket minimal 1',
        ];
    }
}
