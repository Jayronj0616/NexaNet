<?php

namespace App\Services;

use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TicketAttachmentService
{
    /**
     * @param UploadedFile[] $files
     */
    public function storeForTicket(
        SupportTicket $ticket,
        array $files,
        User $user,
        ?TicketReply $reply = null
    ): void {
        foreach ($files as $file) {
            $path = $file->store("ticket-attachments/{$ticket->id}", 'local');

            SupportTicketAttachment::create([
                'support_ticket_id' => $ticket->id,
                'ticket_reply_id' => $reply?->id,
                'user_id' => $user->id,
                'original_name' => $file->getClientOriginalName(),
                'storage_path' => $path,
                'mime_type' => $file->getClientMimeType(),
                'size_bytes' => $file->getSize(),
            ]);
        }
    }

    public function download(SupportTicketAttachment $attachment): StreamedResponse
    {
        return Storage::disk('local')->download(
            $attachment->storage_path,
            $attachment->original_name,
            ['Content-Type' => $attachment->mime_type]
        );
    }
}
