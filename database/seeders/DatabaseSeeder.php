<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(['email' => 'nadia.rahma@modest.id'], [
            'name' => 'Nadia Rahma',
            'password' => 'mockup123',
            'role' => UserRole::Admin,
        ]);

        User::updateOrCreate(['email' => 'staff@modest.id'], [
            'name' => 'Petugas Check-in',
            'password' => 'mockup123',
            'role' => UserRole::Staff,
        ]);

        $this->call(EventDemoSeeder::class);
    }
}
