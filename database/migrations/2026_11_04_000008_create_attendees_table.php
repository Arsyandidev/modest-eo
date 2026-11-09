<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // satu baris = satu e-tiket / satu peserta
        Schema::create('attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ticket_type_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete(); // denormalisasi untuk query check-in per event
            $table->string('ticket_code', 20)->unique(); // MDS-XXXXXX, isi QR
            $table->string('name');
            $table->timestamp('checked_in_at')->nullable();
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['event_id', 'checked_in_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendees');
    }
};
