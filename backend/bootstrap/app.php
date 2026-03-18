<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

$trustedHosts = static function (): array {
    $hosts = [
        '^localhost$',
        '^127\.0\.0\.1$',
        '^healthcheck\.railway\.app$',
    ];

    $urls = array_filter(array_map(
        static fn (string $value): string => trim($value),
        [
            (string) env('APP_URL', ''),
            (string) env('FRONTEND_URL', ''),
            ...explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
        ],
    ));

    foreach ($urls as $url) {
        $host = parse_url($url, PHP_URL_HOST);

        if (! is_string($host) || $host === '') {
            continue;
        }

        $hosts[] = '^'.preg_quote($host, '/').'$';
    }

    return array_values(array_unique($hosts));
};

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) use ($trustedHosts): void {
        // Register role middleware alias
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);

        // Allow local development hosts, the configured app domain, and Railway health checks.
        $middleware->trustHosts(at: $trustedHosts);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for unauthenticated API requests
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });
    })->create();
