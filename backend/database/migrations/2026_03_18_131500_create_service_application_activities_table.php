<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_application_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_application_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('description');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        $activities = [];

        foreach (DB::table('service_applications')->orderBy('id')->get() as $application) {
            $activities[] = [
                'service_application_id' => $application->id,
                'user_id' => null,
                'type' => 'submitted',
                'title' => 'Application submitted',
                'description' => 'The applicant submitted a new service request.',
                'meta' => null,
                'created_at' => $application->created_at,
                'updated_at' => $application->created_at,
            ];

            if ($application->notes) {
                $activities[] = [
                    'service_application_id' => $application->id,
                    'user_id' => $application->reviewed_by,
                    'type' => 'notes_updated',
                    'title' => 'Internal notes added',
                    'description' => 'Internal notes were added to the application record.',
                    'meta' => null,
                    'created_at' => $application->updated_at,
                    'updated_at' => $application->updated_at,
                ];
            }

            if (in_array($application->status, ['approved', 'rejected', 'installation_scheduled', 'installation_complete', 'activated'], true)) {
                $reviewTimestamp = $application->reviewed_at
                    ?? $application->scheduled_at
                    ?? $application->installation_completed_at
                    ?? $application->activated_at
                    ?? $application->updated_at;

                $activities[] = [
                    'service_application_id' => $application->id,
                    'user_id' => $application->reviewed_by,
                    'type' => $application->status === 'rejected' ? 'rejected' : 'approved',
                    'title' => $application->status === 'rejected' ? 'Application rejected' : 'Application processed',
                    'description' => $application->status === 'rejected'
                        ? ($application->rejection_reason ?: 'The application did not move forward after review.')
                        : 'The application passed review and is ready for the next workflow step.',
                    'meta' => null,
                    'created_at' => $reviewTimestamp,
                    'updated_at' => $reviewTimestamp,
                ];
            }

            if (in_array($application->status, ['installation_scheduled', 'installation_complete', 'activated'], true)) {
                $scheduleTimestamp = $application->scheduled_at
                    ?? $application->installation_completed_at
                    ?? $application->activated_at
                    ?? $application->updated_at;

                $activities[] = [
                    'service_application_id' => $application->id,
                    'user_id' => $application->reviewed_by,
                    'type' => 'installation_scheduled',
                    'title' => 'Installation scheduled',
                    'description' => $application->technician_name && $application->installation_date
                        ? "Installation was scheduled with {$application->technician_name} on {$application->installation_date}."
                        : 'The application was moved to the installation queue.',
                    'meta' => null,
                    'created_at' => $scheduleTimestamp,
                    'updated_at' => $scheduleTimestamp,
                ];
            }

            if (in_array($application->status, ['installation_complete', 'activated'], true)) {
                $completionTimestamp = $application->installation_completed_at
                    ?? $application->activated_at
                    ?? $application->updated_at;

                $activities[] = [
                    'service_application_id' => $application->id,
                    'user_id' => $application->reviewed_by,
                    'type' => 'installation_completed',
                    'title' => 'Installation completed',
                    'description' => 'The on-site installation work was marked as complete.',
                    'meta' => null,
                    'created_at' => $completionTimestamp,
                    'updated_at' => $completionTimestamp,
                ];
            }

            if ($application->status === 'activated') {
                $activationTimestamp = $application->activated_at ?? $application->updated_at;

                $activities[] = [
                    'service_application_id' => $application->id,
                    'user_id' => $application->reviewed_by,
                    'type' => 'activated',
                    'title' => 'Account activated',
                    'description' => 'The customer account and subscription were created.',
                    'meta' => null,
                    'created_at' => $activationTimestamp,
                    'updated_at' => $activationTimestamp,
                ];
            }
        }

        if ($activities !== []) {
            DB::table('service_application_activities')->insert($activities);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('service_application_activities');
    }
};
