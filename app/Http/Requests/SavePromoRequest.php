<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePromoRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['code' => strtoupper(preg_replace('/\s+/', '', (string) $this->code))]);
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('promos', 'code')->ignore($this->route('promo'))],
            'type' => ['required', Rule::in(['pct', 'fix'])],
            'val' => ['required', 'integer', 'min:1', Rule::when($this->type === 'pct', 'max:100')],
            'quota' => ['required', 'integer', 'min:1'],
            'ev' => ['nullable', 'string', 'exists:events,slug'],
            'until' => ['nullable', 'date'],
            'active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'Kode promo sudah dipakai',
            'val.max' => 'Persentase maksimal 100%',
        ];
    }
}
