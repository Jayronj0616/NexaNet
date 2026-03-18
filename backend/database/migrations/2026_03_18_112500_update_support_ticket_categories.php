<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement(
            "ALTER TABLE support_tickets MODIFY category ENUM('application', 'billing', 'technical', 'account', 'general') NOT NULL DEFAULT 'general'"
        );
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement(
            "ALTER TABLE support_tickets MODIFY category ENUM('billing', 'technical', 'account', 'general') NOT NULL DEFAULT 'general'"
        );
    }
};
