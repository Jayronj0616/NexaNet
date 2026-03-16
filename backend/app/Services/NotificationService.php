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
     * @return Notification
     */
    public function notify($userId, $title, $message, $type = 'info')
    {
        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'is_read' => false
        ]);
    }
}
