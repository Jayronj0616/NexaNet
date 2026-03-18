<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('service_applications', 'scheduled_at')) {
            Schema::table('service_applications', function (Blueprint $table) {
                $table->timestamp('scheduled_at')->nullable()->after('reviewed_at');
            });
        }

        if (! Schema::hasColumn('service_applications', 'installation_completed_at')) {
            Schema::table('service_applications', function (Blueprint $table) {
                $table->timestamp('installation_completed_at')->nullable()->after('scheduled_at');
            });
        }

        if (! Schema::hasColumn('service_applications', 'activated_at')) {
            Schema::table('service_applications', function (Blueprint $table) {
                $table->timestamp('activated_at')->nullable()->after('installation_completed_at');
            });
        }

        DB::table('service_applications')
            ->whereIn('status', ['installation_scheduled', 'installation_complete', 'activated'])
            ->whereNull('scheduled_at')
            ->update([
                'scheduled_at' => DB::raw('COALESCE(reviewed_at, updated_at, created_at)'),
            ]);

        DB::table('service_applications')
            ->whereIn('status', ['installation_complete', 'activated'])
            ->whereNull('installation_completed_at')
            ->update([
                'installation_completed_at' => DB::raw('COALESCE(updated_at, scheduled_at, reviewed_at, created_at)'),
            ]);

        DB::table('service_applications')
            ->where('status', 'activated')
            ->whereNull('activated_at')
            ->update([
                'activated_at' => DB::raw('COALESCE(updated_at, installation_completed_at, scheduled_at, reviewed_at, created_at)'),
            ]);
    }

    public function down(): void
    {
        $columnsToDrop = array_filter([
            Schema::hasColumn('service_applications', 'scheduled_at') ? 'scheduled_at' : null,
            Schema::hasColumn('service_applications', 'installation_completed_at') ? 'installation_completed_at' : null,
            Schema::hasColumn('service_applications', 'activated_at') ? 'activated_at' : null,
        ]);

        if ($columnsToDrop !== []) {
            Schema::table('service_applications', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }
    }
};
