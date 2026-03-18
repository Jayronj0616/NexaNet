<?php

use Illuminate\Support\Facades\Route;

// Auth Controllers
use App\Http\Controllers\Auth\AuthController;

// Public Controllers
use App\Http\Controllers\Public\PlanController as PublicPlanController;
use App\Http\Controllers\Public\ServiceAreaController as PublicServiceAreaController;
use App\Http\Controllers\Public\ServiceApplicationController as PublicApplicationController;
use App\Http\Controllers\Public\AnnouncementController as PublicAnnouncementController;

// Customer Controllers
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\BillController as CustomerBillController;
use App\Http\Controllers\Customer\PaymentController as CustomerPaymentController;
use App\Http\Controllers\Customer\TicketController as CustomerTicketController;
use App\Http\Controllers\Customer\NotificationController as CustomerNotificationController;
use App\Http\Controllers\Customer\PlanChangeRequestController as CustomerPlanChangeController;

// Admin Controllers
use App\Http\Controllers\Admin\SubscriberController;
use App\Http\Controllers\Admin\ServiceApplicationController as AdminApplicationController;
use App\Http\Controllers\Admin\BillController as AdminBillController;
use App\Http\Controllers\Admin\TicketController as AdminTicketController;
use App\Http\Controllers\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;

// SuperAdmin Controllers
use App\Http\Controllers\SuperAdmin\PlanController as SuperAdminPlanController;
use App\Http\Controllers\SuperAdmin\StaffController;
use App\Http\Controllers\SuperAdmin\SystemSettingController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\PlanChangeRequestController as SuperAdminPlanChangeController;

/*
|--------------------------------------------------------------------------
| Auth Routes (no guard)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']); // customer self-register (post-activation)

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

/*
|--------------------------------------------------------------------------
| Public Routes (no auth)
|--------------------------------------------------------------------------
*/
Route::prefix('public')->group(function () {
    Route::get('plans', [PublicPlanController::class, 'index']);
    Route::get('plans/{plan}', [PublicPlanController::class, 'show']);

    Route::get('service-areas', [PublicServiceAreaController::class, 'index']);
    Route::post('service-areas/check', [PublicServiceAreaController::class, 'check']);

    Route::post('applications', [PublicApplicationController::class, 'store']);
    Route::get('applications/track', [PublicApplicationController::class, 'track']); // ?reference=xxx or ?email=xxx

    Route::get('announcements', [PublicAnnouncementController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/
Route::prefix('customer')
    ->middleware(['auth:sanctum', 'role:customer'])
    ->group(function () {
        Route::get('dashboard', [CustomerDashboardController::class, 'index']);

        // Bills
        Route::get('bills', [CustomerBillController::class, 'index']);
        Route::get('bills/{bill}', [CustomerBillController::class, 'show']);

        // Payments (scaffolded)
        Route::post('payments/initiate', [CustomerPaymentController::class, 'initiate']);
        Route::get('payments', [CustomerPaymentController::class, 'index']);

        // Tickets
        Route::get('tickets', [CustomerTicketController::class, 'index']);
        Route::post('tickets', [CustomerTicketController::class, 'store']);
        Route::get('tickets/{ticket}', [CustomerTicketController::class, 'show']);
        Route::get('tickets/{ticket}/attachments/{attachment}', [CustomerTicketController::class, 'downloadAttachment']);
        Route::post('tickets/{ticket}/replies', [CustomerTicketController::class, 'reply']);

        // Notifications
        Route::get('notifications', [CustomerNotificationController::class, 'index']);
        Route::patch('notifications/{notification}/read', [CustomerNotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [CustomerNotificationController::class, 'markAllRead']);

        // Plan change requests
        Route::get('plan-change-requests', [CustomerPlanChangeController::class, 'index']);
        Route::post('plan-change-requests', [CustomerPlanChangeController::class, 'store']);
    });

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin,superadmin'])
    ->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index']);

        // Subscribers
        Route::get('subscribers', [SubscriberController::class, 'index']);
        Route::get('subscribers/{user}', [SubscriberController::class, 'show']);
        Route::patch('subscribers/{user}/toggle-status', [SubscriberController::class, 'toggleStatus']);

        // Service Applications
        Route::get('applications', [AdminApplicationController::class, 'index']);
        Route::get('applications/{application}', [AdminApplicationController::class, 'show']);
        Route::patch('applications/{application}/notes', [AdminApplicationController::class, 'updateNotes']);
        Route::patch('applications/{application}/approve', [AdminApplicationController::class, 'approve']);
        Route::patch('applications/{application}/reject', [AdminApplicationController::class, 'reject']);
        Route::patch('applications/{application}/schedule', [AdminApplicationController::class, 'schedule']);
        Route::patch('applications/{application}/complete-installation', [AdminApplicationController::class, 'completeInstallation']);
        Route::patch('applications/{application}/activate', [AdminApplicationController::class, 'activate']);

        // Billing
        Route::get('bills', [AdminBillController::class, 'index']);
        Route::get('bills/{bill}', [AdminBillController::class, 'show']);
        Route::post('bills/generate', [AdminBillController::class, 'generate']);
        Route::patch('bills/{bill}/mark-paid', [AdminBillController::class, 'markPaid']);
        Route::patch('bills/{bill}/cancel', [AdminBillController::class, 'cancel']);

        // Support Tickets
        Route::get('tickets', [AdminTicketController::class, 'index']);
        Route::get('tickets/{ticket}', [AdminTicketController::class, 'show']);
        Route::get('tickets/{ticket}/attachments/{attachment}', [AdminTicketController::class, 'downloadAttachment']);
        Route::patch('tickets/{ticket}/status', [AdminTicketController::class, 'updateStatus']);
        Route::post('tickets/{ticket}/replies', [AdminTicketController::class, 'reply']);

        // Announcements
        Route::get('announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('announcements', [AdminAnnouncementController::class, 'store']);
        Route::get('announcements/{announcement}', [AdminAnnouncementController::class, 'show']);
        Route::put('announcements/{announcement}', [AdminAnnouncementController::class, 'update']);
        Route::delete('announcements/{announcement}', [AdminAnnouncementController::class, 'destroy']);

    });

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('superadmin')
    ->middleware(['auth:sanctum', 'role:superadmin'])
    ->group(function () {
        Route::get('dashboard', [SuperAdminDashboardController::class, 'index']);

        // Plans
        Route::get('plans', [SuperAdminPlanController::class, 'index']);
        Route::post('plans', [SuperAdminPlanController::class, 'store']);
        Route::get('plans/{plan}', [SuperAdminPlanController::class, 'show']);
        Route::put('plans/{plan}', [SuperAdminPlanController::class, 'update']);
        Route::patch('plans/{plan}/toggle', [SuperAdminPlanController::class, 'toggle']);
        Route::delete('plans/{plan}', [SuperAdminPlanController::class, 'destroy']);

        // Plan change requests
        Route::get('plan-change-requests', [SuperAdminPlanChangeController::class, 'index']);
        Route::patch('plan-change-requests/{request}/approve', [SuperAdminPlanChangeController::class, 'approve']);
        Route::patch('plan-change-requests/{request}/reject', [SuperAdminPlanChangeController::class, 'reject']);

        // Staff management
        Route::get('staff', [StaffController::class, 'index']);
        Route::post('staff', [StaffController::class, 'store']);
        Route::get('staff/{user}', [StaffController::class, 'show']);
        Route::put('staff/{user}', [StaffController::class, 'update']);
        Route::patch('staff/{user}/toggle-status', [StaffController::class, 'toggleStatus']);
        Route::delete('staff/{user}', [StaffController::class, 'destroy']);

        // System settings
        Route::get('settings', [SystemSettingController::class, 'index']);
        Route::put('settings', [SystemSettingController::class, 'update']);
    });

/*
|--------------------------------------------------------------------------
| Payment Webhook (no auth - called by Stripe/PayMongo)
|--------------------------------------------------------------------------
*/
Route::post('payments/webhook', [CustomerPaymentController::class, 'webhook']);
