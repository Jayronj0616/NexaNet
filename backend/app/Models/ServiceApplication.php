<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'barangay',
        'city',
        'province',
        'zip_code',
        'plan_id',
        'status',
        'technician_name',
        'installation_date',
        'rejection_reason',
        'notes',
        'reviewed_by',
        'reviewed_at',
        'scheduled_at',
        'installation_completed_at',
        'activated_at',
        'user_id',
    ];

    protected $casts = [
        'installation_date' => 'date',
        'reviewed_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'installation_completed_at' => 'datetime',
        'activated_at' => 'datetime',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activities()
    {
        return $this->hasMany(ServiceApplicationActivity::class)
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    public function recordActivity(
        string $type,
        string $title,
        string $description,
        ?User $actor = null,
        array $meta = []
    ): ServiceApplicationActivity {
        return $this->activities()->create([
            'type' => $type,
            'title' => $title,
            'description' => $description,
            'user_id' => $actor?->id,
            'meta' => $meta === [] ? null : $meta,
        ]);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending Review',
            'approved' => 'Processed',
            'rejected' => 'Rejected',
            'installation_scheduled' => 'For Installation',
            'installation_complete' => 'Installation Complete',
            'activated' => 'Activated',
            default => str($this->status)->replace('_', ' ')->title()->toString(),
        };
    }

    public function getStatusDescriptionAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Your application has been received and is waiting for review.',
            'approved' => 'Your application has been processed and is waiting for installation scheduling.',
            'rejected' => 'Your application was reviewed but could not move forward.',
            'installation_scheduled' => $this->installation_date && $this->technician_name
                ? "Installation is scheduled on {$this->installation_date->format('F j, Y')} with {$this->technician_name}."
                : 'Your application has been processed and is now queued for installation.',
            'installation_complete' => 'Installation work is complete and your account is being prepared.',
            'activated' => 'Your service application is complete and your account is already active.',
            default => 'Your application is currently being updated.',
        };
    }

    public function getTimelineAttribute(): array
    {
        $reviewState = match ($this->status) {
            'pending', 'approved' => 'current',
            'rejected' => 'failed',
            default => 'completed',
        };

        return [
            $this->timelineItem(
                key: 'submitted',
                label: 'Application Submitted',
                description: 'We received your request and created your tracking reference.',
                state: 'completed',
                timestamp: $this->created_at,
            ),
            $this->timelineItem(
                key: 'review',
                label: match ($this->status) {
                    'pending' => 'Pending Review',
                    'rejected' => 'Rejected',
                    default => 'Processed',
                },
                description: match ($this->status) {
                    'pending' => 'Your application is in the review queue.',
                    'rejected' => $this->rejection_reason
                        ? "The request stopped here: {$this->rejection_reason}"
                        : 'The application did not pass review.',
                    default => 'The application passed initial review and can move to scheduling.',
                },
                state: $reviewState,
                timestamp: $this->reviewed_at
                    ?? ($this->status === 'pending'
                        ? null
                        : ($this->scheduled_at
                            ?? $this->installation_completed_at
                            ?? $this->activated_at
                            ?? $this->updated_at)),
            ),
            $this->timelineItem(
                key: 'installation',
                label: 'For Installation',
                description: $this->technician_name && $this->installation_date
                    ? "Scheduled on {$this->installation_date->format('F j, Y')} with {$this->technician_name}."
                    : 'Waiting for the installation schedule to be confirmed.',
                state: match ($this->status) {
                    'installation_scheduled' => 'current',
                    'installation_complete', 'activated' => 'completed',
                    default => 'upcoming',
                },
                timestamp: $this->scheduled_at ?? $this->installation_date,
            ),
            $this->timelineItem(
                key: 'installation_complete',
                label: 'Installation Complete',
                description: 'Physical setup is done and the service is ready for account activation.',
                state: match ($this->status) {
                    'installation_complete' => 'current',
                    'activated' => 'completed',
                    default => 'upcoming',
                },
                timestamp: $this->installation_completed_at
                    ?? ($this->status === 'activated' ? $this->activated_at : null),
            ),
            $this->timelineItem(
                key: 'activated',
                label: 'Activated',
                description: 'The account has been created and login access is ready.',
                state: $this->status === 'activated' ? 'current' : 'upcoming',
                timestamp: $this->activated_at,
            ),
        ];
    }

    private function timelineItem(
        string $key,
        string $label,
        string $description,
        string $state,
        mixed $timestamp
    ): array {
        return [
            'key' => $key,
            'label' => $label,
            'description' => $description,
            'state' => $state,
            'timestamp' => $timestamp?->toISOString(),
        ];
    }
}
