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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 30)->unique(); // INV-YYMM-0001
            $table->string('access_token', 64)->unique(); // akses pembeli tanpa akun (Tiket Saya, bayar)
            $table->foreignId('event_id')->constrained()->restrictOnDelete(); // event bertransaksi tidak boleh dihapus

            $table->string('buyer_name');
            $table->string('buyer_email')->nullable(); // boleh kosong untuk transaksi manual
            $table->string('buyer_phone', 30)->nullable();

            // promo disimpan sebagai snapshot kode, karena promonya bisa dihapus
            $table->foreignId('promo_id')->nullable()->constrained()->nullOnDelete();
            $table->string('promo_code', 50)->nullable();

            $table->unsignedInteger('subtotal')->default(0);
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('service_fee')->default(0);
            $table->unsignedInteger('total')->default(0);

            $table->string('payment_method', 30); // VA BCA, QRIS, Tunai, Komplimen, Gratis, ...
            $table->string('status', 20)->default('pending'); // pending | paid | cancelled | refunded
            $table->string('source', 10)->default('web'); // web | admin (on-site)
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); // admin pembuat transaksi manual

            $table->timestamp('expires_at')->nullable(); // batas waktu pembayaran
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->string('refund_reason')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
