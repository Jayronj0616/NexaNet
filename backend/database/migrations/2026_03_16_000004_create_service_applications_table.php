<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_applications', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->string('address');
            $table->string('barangay');
            $table->string('city');
            $table->string('province');
            $table->string('zip_code')->nullable();
            $table->foreignId('plan_id')->constrained()->onDelete('restrict');
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'installation_scheduled',
                'installation_complete',
                'activated'
            ])->default('pending');
            $table->string('technician_name')->nullable();
            $table->date('installation_date')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_applications');
    }
};
