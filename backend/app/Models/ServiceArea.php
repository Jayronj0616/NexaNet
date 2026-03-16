<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay',
        'city',
        'province',
        'zip_code',
        'is_serviceable',
        'notes',
    ];

    protected $casts = [
        'is_serviceable' => 'boolean',
    ];
}
