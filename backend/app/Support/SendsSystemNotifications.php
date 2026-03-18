<?php

namespace App\Support;

use App\Mail\SystemNotificationMail;
use Illuminate\Support\Facades\Mail;

trait SendsSystemNotifications
{
    protected function frontendUrl(string $path = ''): string
    {
        $base = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $normalizedPath = ltrim($path, '/');

        return $normalizedPath === '' ? $base : "{$base}/{$normalizedPath}";
    }

    protected function sendSystemEmail(
        string $to,
        string $title,
        string $message,
        ?string $actionUrl = null,
        ?string $actionText = null
    ): void {
        try {
            Mail::to($to)->send(new SystemNotificationMail($title, $message, $actionUrl, $actionText));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
}
