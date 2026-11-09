<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PromoType;
use App\Http\Controllers\Controller;
use App\Http\Requests\SavePromoRequest;
use App\Http\Resources\PromoResource;
use App\Models\Event;
use App\Models\Promo;
use Illuminate\Http\JsonResponse;

class PromoController extends Controller
{
    public function store(SavePromoRequest $request): PromoResource
    {
        return PromoResource::make(Promo::create($this->attributes($request))->load('event:id,slug'));
    }

    public function update(SavePromoRequest $request, Promo $promo): PromoResource
    {
        $promo->update($this->attributes($request));

        return PromoResource::make($promo->load('event:id,slug'));
    }

    // riwayat transaksi tetap aman: orders.promo_id menjadi null, promo_code tetap tersimpan
    public function destroy(Promo $promo): JsonResponse
    {
        $promo->delete();

        return response()->json(['ok' => true]);
    }

    private function attributes(SavePromoRequest $request): array
    {
        $data = $request->validated();

        return [
            'code' => $data['code'],
            'type' => $data['type'] === 'pct' ? PromoType::Percent : PromoType::Fixed,
            'value' => $data['val'],
            'quota' => $data['quota'],
            'event_id' => empty($data['ev']) ? null : Event::where('slug', $data['ev'])->value('id'),
            'valid_until' => $data['until'] ?: null,
            'is_active' => $data['active'] ?? true,
        ];
    }
}
