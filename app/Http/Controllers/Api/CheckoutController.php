<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Event;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\PromoService;
use App\Support\EvBoot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

// endpoint situs publik: cek promo, checkout, simulasi bayar, Tiket Saya
class CheckoutController extends Controller
{
    public function __construct(private OrderService $orders) {}

    public function checkPromo(Request $request, PromoService $promos): JsonResponse
    {
        $data = $request->validate(['code' => ['required', 'string', 'max:50'], 'ev' => ['required', 'string']]);
        $promo = $promos->check($data['code'], Event::published()->where('slug', $data['ev'])->firstOrFail());

        return response()->json(['code' => $promo->code, 'type' => $promo->type->value === 'percent' ? 'pct' : 'fix', 'val' => $promo->value]);
    }

    public function store(CheckoutRequest $request): JsonResponse
    {
        $event = Event::published()->where('slug', $request->ev)->firstOrFail();

        return $this->respond($this->orders->create($event, $request->validated(), OrderSource::Web));
    }

    // mockup: menggantikan callback payment gateway
    public function pay(string $token): JsonResponse
    {
        $order = Order::where('access_token', $token)->firstOrFail();

        if ($order->status !== OrderStatus::Pending) {
            throw ValidationException::withMessages(['status' => 'Pesanan ini tidak menunggu pembayaran']);
        }

        return $this->respond($this->orders->transition($order, OrderStatus::Paid));
    }

    // daftar "Tiket Saya" berdasarkan token yang tersimpan di browser pembeli
    public function mine(Request $request): JsonResponse
    {
        $tokens = $request->validate(['tokens' => ['array', 'max:50'], 'tokens.*' => ['string', 'max:64']])['tokens'] ?? [];

        $orders = Order::with(['event:id,slug', 'items', 'attendees'])
            ->whereIn('access_token', $tokens)
            ->latest('id')
            ->get()
            ->map(fn (Order $o) => $this->orderPayload($o));

        return response()->json($orders);
    }

    private function respond(Order $order): JsonResponse
    {
        return response()->json([
            'order' => $this->orderPayload($order),
            'event' => EvBoot::publicEvent($order->event_id),
        ]);
    }

    private function orderPayload(Order $order): array
    {
        return OrderResource::make($order)->resolve() + ['token' => $order->access_token];
    }
}
