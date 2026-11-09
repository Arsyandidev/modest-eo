<?php

namespace App\Http\Resources;

use App\Enums\PromoType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Promo
 */
class PromoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->id,
            'code' => $this->code,
            'type' => $this->type === PromoType::Percent ? 'pct' : 'fix',
            'val' => $this->value,
            'quota' => $this->quota,
            'ev' => (string) $this->event?->slug,
            'until' => $this->valid_until?->toDateString() ?? '',
            'active' => $this->is_active,
        ];
    }
}
