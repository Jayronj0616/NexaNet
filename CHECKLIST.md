# NexaNet — Full-Stack ISP Web App
## Master Build Checklist

> **Stack:** Next.js 14 (App Router) + Tailwind CSS + SweetAlert2 | Laravel 11 REST API | MySQL + Eloquent | Laravel Sanctum | Payment Scaffold (Stripe/PayMongo)
> **Structure:** `nexanet/frontend` + `nexanet/backend`
> **Portals:** `/` (public) | `/customer` | `/admin` | `/superadmin`
> **Roles:** superadmin, admin, customer (no technician portal)

---

## LEGEND
- [x] = Done
- [ ] = Not yet done
- [STUB] = File created but logic is placeholder/scaffold only

---

## PHASE 1 — PROJECT SETUP

- [x] Create `nexanet/backend` — Laravel 11 fresh install
- [x] Create `nexanet/frontend` — Next.js 14 (App Router, TypeScript, Tailwind)
- [x] Install `laravel/sanctum` in backend
- [x] Install `axios`, `sweetalert2` in frontend
- [x] Configure `backend/.env` — MySQL, Sanctum, CORS, app name
- [x] Run `php artisan install:api`

---

## PHASE 2 — DATABASE

### Migrations (all in `backend/database/migrations/`)
- [x] `create_users_table` — role enum: superadmin, admin, customer; softDeletes
- [x] `create_plans_table` — name, speed_mbps, price, billing_cycle, features (json), is_active; softDeletes
- [x] `create_service_areas_table` — barangay, city, province, zip_code, is_serviceable
- [x] `create_service_applications_table` — reference_number, status enum (6 steps), technician_name, installation_date, reviewed_by
- [x] `create_subscriptions_table` — user_id, plan_id, status, start/end/next_billing dates; softDeletes
- [x] `create_bills_table` — bill_number, amount, billing period, due_date, status enum, paid_at
- [x] `create_payments_table` — bill_id, method enum, status enum, gateway_response (json), transaction_reference
- [x] `create_support_tickets_table` — ticket_number, category, priority, status, assigned_to; softDeletes
- [x] `create_ticket_replies_table` — ticket_id, user_id, message, is_staff_reply
- [x] `create_announcements_table` — type enum, is_published, published_at, expires_at; softDeletes
- [x] `create_notifications_table` — user_id, title, message, type, is_read, read_at
- [x] `create_system_settings_table` — key, value, type, group, label
- [x] `create_plan_change_requests_table` — current_plan_id, requested_plan_id, type, status, reviewed_by
- [x] `create_personal_access_tokens_table` — from Sanctum install

### Seeders (all in `backend/database/seeders/`)
- [x] `UserSeeder` — superadmin, admin, customer test accounts (password: `password`)
- [x] `PlanSeeder` — 4 plans: Basic 25, Standard 50, Premium 100, Business 200
- [x] `ServiceAreaSeeder` — 7 sample barangays across QC, Caloocan, Marikina
- [x] `SystemSettingSeeder` — company info, bill_due_days, maintenance_mode
- [x] `DatabaseSeeder` — calls all 4 seeders in order

---

## PHASE 3 — BACKEND MODELS

All in `backend/app/Models/`

- [x] `User.php` — HasApiTokens, SoftDeletes, helper methods (isSuperAdmin, isAdmin, isCustomer, getFullNameAttribute), all relationships
- [x] `Plan.php` — SoftDeletes, features cast to array, relationships
- [x] `ServiceArea.php`
- [x] `ServiceApplication.php` — getFullNameAttribute, relationships to plan/reviewer/user
- [x] `Subscription.php` — SoftDeletes, relationships
- [x] `Bill.php` — date casts, relationships
- [x] `Payment.php` — gateway_response cast to array
- [x] `SupportTicket.php` — SoftDeletes, relationships
- [x] `TicketReply.php`
- [x] `Announcement.php` — SoftDeletes
- [x] `Notification.php`
- [x] `SystemSetting.php` — static get/set helpers
- [x] `PlanChangeRequest.php`

---

## PHASE 4 — BACKEND AUTH & ROUTING

- [x] `app/Http/Middleware/RoleMiddleware.php` — checks role, is_active; returns 401/403 JSON
- [x] `bootstrap/app.php` — registers RoleMiddleware alias (`role`), statefulApi(), JSON 401 handler
- [x] `routes/api.php` — all routes defined for all portals:
  - [x] `/api/auth` — login, logout, me, register
  - [x] `/api/public` — plans, service-areas, applications, announcements
  - [x] `/api/customer` — dashboard, bills, payments, tickets, notifications, plan-change-requests
  - [x] `/api/admin` — dashboard, subscribers, applications (full flow), billing, tickets, announcements, plan-change-requests
  - [x] `/api/superadmin` — dashboard, plans, staff, settings
  - [x] `/api/payments/webhook` — scaffold only

---

## PHASE 5 — BACKEND CONTROLLERS

### Auth (`app/Http/Controllers/Auth/`)
- [x] `AuthController.php` — login (token), logout, me (with subscription), register

### Public (`app/Http/Controllers/Public/`)
- [x] `PlanController.php` — index (active only), show
- [x] `ServiceAreaController.php` — index, check (by barangay+city)
- [x] `ServiceApplicationController.php` — store (generates reference_number), track (by reference or email)
- [x] `AnnouncementController.php` — index (published, not expired)

### Customer (`app/Http/Controllers/Customer/`)
- [x] `DashboardController.php` — subscription, latest bill, unread notifications, open tickets
- [x] `BillController.php` — index (paginated), show (with payments)
- [x] `PaymentController.php` [STUB] — initiate (scaffold), webhook (scaffold), index
- [x] `TicketController.php` — index, store, show (with replies), reply
- [x] `NotificationController.php` — index, markRead, markAllRead
- [x] `PlanChangeRequestController.php` — index, store

### Admin (`app/Http/Controllers/Admin/`)
- [x] `DashboardController.php` — counts: pending apps, active subscribers, unpaid bills, open tickets
- [x] `SubscriberController.php` — index (paginated+search), show (with subscription+bills), toggleStatus
- [x] `ServiceApplicationController.php` — index, show, approve, reject, schedule (assign technician+date), completeInstallation, activate (creates user+subscription, sends email)
- [x] `BillController.php` — index, show, generate (bulk for all active subscribers), markPaid, cancel
- [x] `TicketController.php` — index, show, updateStatus, reply (staff reply)
- [x] `AnnouncementController.php` — index, store, show, update, destroy

### SuperAdmin (`app/Http/Controllers/SuperAdmin/`)
- [x] `DashboardController.php` — system-wide stats
- [x] `PlanController.php` — index, store, show, update, toggle (activate/deactivate), destroy
- [x] `StaffController.php` — index, store, show, update, toggleStatus, destroy
- [x] `SystemSettingController.php` — index (grouped), update (bulk key-value)
- [x] `PlanChangeRequestController.php` — index, approve (swaps subscription plan), reject

---

## PHASE 6 — BACKEND SERVICES & MAIL

### Services (`app/Services/`)
- [x] `BillingService.php` — generateMonthlyBills(), generateBillForSubscriber(), markOverdue()
- [x] `NotificationService.php` — notify(userId, title, message, type, link)
- [x] `PaymentService.php` [STUB] — initiate(), verify(), refund() — scaffold with TODO comments

### Mail (`app/Mail/`)
- [x] `SystemNotificationMail.php` — Universal dynamic mail class replacing the 9 separate ones

### Mail Views (`resources/views/emails/`)
- [x] `system-notification.blade.php` — Universal dynamic blade template

---

## PHASE 7 — BACKEND CORS CONFIG

- [x] `config/cors.php` — allow `http://localhost:3000`, all headers, credentials: true

---

## PHASE 8 — FRONTEND SETUP

### Base Config
- [ ] `lib/api.ts` — Axios instance: baseURL = `http://localhost:8000/api`, interceptors (attach token, handle 401 redirect)
- [ ] `lib/auth.ts` — getToken(), setToken(), removeToken(), getUser(), isRole()
- [ ] `lib/utils.ts` — formatCurrency(), formatDate(), formatStatus(), cn() helper
- [ ] `types/index.ts` — TypeScript interfaces: User, Plan, Bill, Ticket, Application, Subscription, Notification, Announcement, Payment, PlanChangeRequest
- [ ] `middleware.ts` — protect `/customer`, `/admin`, `/superadmin` routes by role; redirect unauthenticated to `/login`

### Shared UI Components (`components/ui/`)
- [x] `Modal.tsx` — reusable modal wrapper
- [x] `DataTable.tsx` — table with pagination, search
- [x] `Badge.tsx` — status badge with color by value
- [x] `StatusBadge.tsx` — pre-mapped colors for app/bill/ticket statuses
- [x] `PageHeader.tsx` — title + optional action button
- [x] `LoadingSpinner.tsx`
- [x] `EmptyState.tsx`
- [x] `ConfirmDialog.tsx` — wraps SweetAlert2 confirm
- [x] `Sidebar.tsx` — collapsible sidebar per portal
- [x] `Topbar.tsx` — user info, notifications bell, logout
- [x] `PortalLayout.tsx` — sidebar + topbar wrapper

---

## PHASE 9 — FRONTEND AUTH

- [x] `app/(auth)/login/page.tsx` — single login page for all roles; redirects by role after login
- [x] `hooks/useAuth.ts` — login(), logout(), user state, role checks

---

## PHASE 10 — FRONTEND PUBLIC PAGES

- [x] `app/(public)/page.tsx` — landing/marketing page
- [x] `app/(public)/plans/page.tsx` — plans & pricing
- [x] `app/(public)/check-availability/page.tsx` — service area checker form
- [x] `app/(public)/apply/page.tsx` — multi-step service application form
- [x] `app/(public)/track/page.tsx` — application status tracker (by reference or email)

---

## PHASE 11 — FRONTEND CUSTOMER PORTAL

All CRUD in modals. Layout: Sidebar + Topbar.

- [ ] `app/customer/layout.tsx` — portal layout wrapper
- [ ] `app/customer/dashboard/page.tsx` — connection status card, current plan, latest bill, quick links
- [ ] `app/customer/billing/page.tsx` — bill list table; modal: view bill details + pay button (scaffold)
- [ ] `app/customer/tickets/page.tsx` — ticket list; modal: submit ticket, view ticket thread + reply
- [ ] `app/customer/notifications/page.tsx` — notification feed, mark as read

---

## PHASE 12 — FRONTEND ADMIN PORTAL

All CRUD in modals. Layout: Sidebar + Topbar.

- [x] `app/admin/layout.tsx`
- [x] `app/admin/dashboard/page.tsx` — stats cards
- [x] `app/admin/subscribers/page.tsx` — table; modal: view subscriber details, toggle status
- [x] `app/admin/applications/page.tsx` — table; modal: view, approve/reject, schedule install, complete, activate
- [x] `app/admin/billing/page.tsx` — table; modal: view bill; action: generate monthly bills (SweetAlert2 confirm), mark paid
- [x] `app/admin/tickets/page.tsx` — table; modal: view thread, reply, update status
- [x] `app/admin/announcements/page.tsx` — table; modal: create, edit, delete

---

## PHASE 13 — FRONTEND SUPERADMIN PORTAL

All CRUD in modals. Inherits all admin pages plus:

- [x] `app/superadmin/layout.tsx`
- [x] `app/superadmin/dashboard/page.tsx`
- [x] `app/superadmin/plans/page.tsx` — table; modal: create, edit, toggle active, delete
- [x] `app/superadmin/staff/page.tsx` — table; modal: create staff, edit, toggle status, delete
- [x] `app/superadmin/settings/page.tsx` — grouped settings form (no modal needed, inline save)
- [x] `app/superadmin/plan-changes/page.tsx` — table; modal: view request, approve/reject

---

## PHASE 14 — PAYMENT SCAFFOLD (Frontend)

- [x] `components/customer/PaymentModal.tsx` — shows bill amount, method selector (Stripe/PayMongo), "Pay Now" button → calls `/api/customer/payments/initiate`; shows stub response with TODO note
- [x] `app/customer/billing/page.tsx` — includes PaymentModal trigger per bill row

---

## PHASE 15 — EMAIL NOTIFICATIONS

Triggered from backend controllers at these events:

| Event | Controller method | Mail class |
|---|---|---|
| Application submitted | `Public\ServiceApplicationController@store` | `ApplicationSubmitted` |
| Application approved | `Admin\ServiceApplicationController@approve` | `ApplicationApproved` |
| Application rejected | `Admin\ServiceApplicationController@reject` | `ApplicationRejected` |
| Installation scheduled | `Admin\ServiceApplicationController@schedule` | `InstallationScheduled` |
| Installation complete | `Admin\ServiceApplicationController@completeInstallation` | `InstallationComplete` |
| Account activated | `Admin\ServiceApplicationController@activate` | `AccountActivated` |
| Bill generated | `Admin\BillController@generate` | `BillGenerated` |
| Ticket status updated | `Admin\TicketController@updateStatus` | `TicketUpdated` |
| Plan change approved | `SuperAdmin\PlanChangeRequestController@approve` | `PlanChangeApproved` |

- [x] All mail classes created (using unified 'SystemNotificationMail' class)
- [x] All blade email templates created (using unified 'system-notification.blade.php')
- [ ] Mail triggered in each controller method above

---

## PHASE 16 — FINAL WIRING & TESTING

- [ ] Test all API endpoints with Postman or Hoppscotch
- [ ] Test role middleware — confirm 403 on wrong role
- [ ] Test seeded accounts can log in and reach correct portal
- [ ] Test service application flow end-to-end (submit → approve → schedule → complete → activate)
- [ ] Test bill generation and payment scaffold
- [ ] Test ticket submission and staff reply
- [ ] Confirm emails are logged (MAIL_MAILER=log) during dev
- [ ] Mobile responsiveness check on all pages

---

## TEST ACCOUNTS (from seeders)

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@nexanet.com | password |
| Admin/Staff | admin@nexanet.com | password |
| Customer | customer@nexanet.com | password |

---

## NEXT IMMEDIATE TASK

> **Continue from: Phase 16 — FINAL WIRING & TESTING**
> 1. Test all CRUD endpoints using Seeded accounts.
> 2. Manually trigger the unified Mail service inside the 9 endpoints.
> 3. Mobile responsiveness check on all portals.
