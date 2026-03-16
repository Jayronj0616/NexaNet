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
        'user_id',
    ];

    protected $casts = [
        'installation_date' => 'date',
        'reviewed_at' => 'datetime',
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
}
