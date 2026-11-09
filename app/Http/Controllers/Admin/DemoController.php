<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Database\Seeders\EventDemoSeeder;
use Illuminate\Http\JsonResponse;

// "Reset Data Demo" — hanya tersedia di environment local
class DemoController extends Controller
{
    public function __invoke(EventDemoSeeder $seeder): JsonResponse
    {
        abort_unless(app()->isLocal(), 403);

        $seeder->wipe();
        $seeder->run();

        return response()->json(['ok' => true]);
    }
}
