<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * Create a new notification for a user.
     *
     * @param int $userId
     * @param string $title
     * @param string $message
     * @param string $type (info|success|warning|error)
     * @param string|null $link
     * @return Notification
     */
    public function notify($userId, $title, $message, $type = 'info', $link = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'link' => $link,
            'is_read' => false
        ]);
    }
}
