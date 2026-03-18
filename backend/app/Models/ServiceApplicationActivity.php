<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceApplicationActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_application_id',
        'user_id',
        'type',
        'title',
        'description',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'actor_name',
        'actor_role',
    ];

    public function serviceApplication()
    {
        return $this->belongsTo(ServiceApplication::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function getActorNameAttribute(): string
    {
        return $this->user?->full_name ?? 'System';
    }

    public function getActorRoleAttribute(): ?string
    {
        return $this->user?->role;
    }
}
