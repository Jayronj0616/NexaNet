<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicketAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'support_ticket_id',
        'ticket_reply_id',
        'user_id',
        'original_name',
        'storage_path',
        'mime_type',
        'size_bytes',
    ];

    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    public function reply()
    {
        return $this->belongsTo(TicketReply::class, 'ticket_reply_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
