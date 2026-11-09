<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Api\CheckoutController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/events');

/* ---------- Situs publik ---------- */
Route::view('/events', 'events.index')->name('events.index');
Route::view('/event', 'events.show')->name('events.show'); // detail via ?id=slug (sementara, mengikuti mockup)

Route::prefix('api')->name('api.')->middleware('throttle:60,1')->controller(CheckoutController::class)->group(function () {
    Route::post('/promos/check', 'checkPromo')->name('promos.check');
    Route::post('/orders', 'store')->name('orders.store');
    Route::post('/orders/mine', 'mine')->name('orders.mine');
    Route::post('/orders/{token}/pay', 'pay')->name('orders.pay');
});

/* ---------- Admin: Event Studio ---------- */
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::view('/login', 'admin.login')->name('login');
        Route::post('/login', [Admin\AuthController::class, 'login'])->name('login.attempt');
    });

    Route::middleware('auth')->group(function () {
        Route::post('/logout', [Admin\AuthController::class, 'logout'])->name('logout');

        Route::view('/', 'admin.index')->name('dashboard');
        Route::view('/events', 'admin.events')->name('events');
        Route::view('/orders', 'admin.orders')->name('orders');
        Route::view('/attendees', 'admin.attendees')->name('attendees');
        Route::view('/promos', 'admin.promos')->name('promos');

        Route::prefix('api')->name('api.')->group(function () {
            Route::controller(Admin\EventController::class)->group(function () {
                Route::post('/events', 'store')->name('events.store');
                Route::put('/events/{event}', 'update')->name('events.update');
                Route::patch('/events/{event}/status', 'status')->name('events.status');
                Route::post('/events/{event}/duplicate', 'duplicate')->name('events.duplicate');
                Route::delete('/events/{event}', 'destroy')->name('events.destroy');
            });

            Route::post('/orders', [Admin\OrderController::class, 'store'])->name('orders.store');
            Route::patch('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->name('orders.status');

            Route::post('/attendees/{attendee:ticket_code}/check-in', [Admin\AttendeeController::class, 'checkIn'])->name('attendees.check-in');
            Route::delete('/attendees/{attendee:ticket_code}/check-in', [Admin\AttendeeController::class, 'undo'])->name('attendees.undo');

            Route::post('/promos', [Admin\PromoController::class, 'store'])->name('promos.store');
            Route::put('/promos/{promo}', [Admin\PromoController::class, 'update'])->name('promos.update');
            Route::delete('/promos/{promo}', [Admin\PromoController::class, 'destroy'])->name('promos.destroy');

            Route::post('/demo/reset', Admin\DemoController::class)->name('demo.reset');
        });
    });
});
