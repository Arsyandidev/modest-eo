<?php

namespace App\Providers;

use App\Support\EvBoot;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // respons JSON tanpa pembungkus "data", sesuai bentuk yang dipakai JS mockup
        JsonResource::withoutWrapping();

        // data awal untuk JS (window.EV_BOOT)
        View::composer('layouts.app', fn ($view) => $view->with('evBoot', EvBoot::public()));
        View::composer('layouts.admin', function ($view) {
            if (auth()->check()) {
                $view->with('evBoot', EvBoot::admin());
            }
        });
    }
}
