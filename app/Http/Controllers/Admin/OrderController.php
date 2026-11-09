<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ManualOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Event;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(private OrderService $orders) {}

    // transaksi manual / penjualan on-site
    public function store(ManualOrderRequest $request): OrderResource
    {
        $event = Event::where('slug', $request->ev)->firstOrFail();

        return OrderResource::make($this->orders->create($event, $request->validated(), OrderSource::Admin, $request->user()));
    }

    // konfirmasi pembayaran, batalkan, atau refund
    public function updateStatus(Request $request, Order $order): OrderResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['paid', 'cancelled', 'refunded'])],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        return OrderResource::make($this->orders->transition($order, OrderStatus::from($data['status']), $data['note'] ?? null));
    }
}
