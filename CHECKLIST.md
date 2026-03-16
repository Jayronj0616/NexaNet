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
- [ ] `NotificationController.php` — index, markRead, markAllRead
- [ ] `PlanChangeRequestController.php` — index, store

### Admin (`app/Http/Controllers/Admin/`)
- [ ] `DashboardController.php` — counts: pending apps, active subscribers, unpaid bills, open tickets
- [ ] `SubscriberController.php` — index (paginated+search), show (with subscription+bills), toggleStatus
- [ ] `ServiceApplicationController.php` — index, show, approve, reject, schedule (assign technician+date), completeInstallation, activate (creates user+subscription, sends email)
- [ ] `BillController.php` — index, show, generate (bulk for all active subscribers), markPaid, cancel
- [ ] `TicketController.php` — index, show, updateStatus, reply (staff reply)
- [ ] `AnnouncementController.php` — index, store, show, update, destroy

### SuperAdmin (`app/Http/Controllers/SuperAdmin/`)
- [ ] `DashboardController.php` — system-wide stats
- [ ] `PlanController.php` — index, store, show, update, toggle (activate/deactivate), destroy
- [ ] `StaffController.php` — index, store, show, update, toggleStatus, destroy
- [ ] `SystemSettingController.php` — index (grouped), update (bulk key-value)
- [ ] `PlanChangeRequestController.php` — index, approve (swaps subscription plan), reject

---

## PHASE 6 — BACKEND SERVICES & MAIL

### Services (`app/Services/`)
- [ ] `BillingService.php` — generateMonthlyBills(), generateBillForSubscriber(), markOverdue()
- [ ] `NotificationService.php` — notify(userId, title, message, type, link)
- [ ] `PaymentService.php` [STUB] — initiate(), verify(), refund() — scaffold with TODO comments

### Mail (`app/Mail/`)
- [ ] `ApplicationSubmitted.php`
- [ ] `ApplicationApproved.php`
- [ ] `ApplicationRejected.php`
- [ ] `InstallationScheduled.php`
- [ ] `InstallationComplete.php`
- [ ] `AccountActivated.php`
- [ ] `BillGenerated.php`
- [ ] `TicketUpdated.php`
- [ ] `PlanChangeApproved.php`

### Mail Views (`resources/views/emails/`)
- [ ] Blade templates for each of the above mails

---

## PHASE 7 — BACKEND CORS CONFIG

- [ ] `config/cors.php` — allow `http://localhost:3000`, all headers, credentials: true

---

## PHASE 8 — FRONTEND SETUP

### Base Config
- [ ] `lib/api.ts` — Axios instance: baseURL = `http://localhost:8000/api`, interceptors (attach token, handle 401 redirect)
- [ ] `lib/auth.ts` — getToken(), setToken(), removeToken(), getUser(), isRole()
- [ ] `lib/utils.ts` — formatCurrency(), formatDate(), formatStatus(), cn() helper
- [ ] `types/index.ts` — TypeScript interfaces: User, Plan, Bill, Ticket, Application, Subscription, Notification, Announcement, Payment, PlanChangeRequest
- [ ] `middleware.ts` — protect `/customer`, `/admin`, `/superadmin` routes by role; redirect unauthenticated to `/login`

### Shared UI Components (`components/ui/`)
- [ ] `Modal.tsx` — reusable modal wrapper
- [ ] `DataTable.tsx` — table with pagination, search
- [ ] `Badge.tsx` — status badge with color by value
- [ ] `StatusBadge.tsx` — pre-mapped colors for app/bill/ticket statuses
- [ ] `PageHeader.tsx` — title + optional action button
- [ ] `LoadingSpinner.tsx`
- [ ] `EmptyState.tsx`
- [ ] `ConfirmDialog.tsx` — wraps SweetAlert2 confirm
- [ ] `Sidebar.tsx` — collapsible sidebar per portal
- [ ] `Topbar.tsx` — user info, notifications bell, logout
- [ ] `PortalLayout.tsx` — sidebar + topbar wrapper

---

## PHASE 9 — FRONTEND AUTH

- [ ] `app/(auth)/login/page.tsx` — single login page for all roles; redirects by role after login
- [ ] `hooks/useAuth.ts` — login(), logout(), user state, role checks

---

## PHASE 10 — FRONTEND PUBLIC PAGES

- [ ] `app/(public)/page.tsx` — landing/marketing page
- [ ] `app/(public)/plans/page.tsx` — plans & pricing
- [ ] `app/(public)/check-availability/page.tsx` — service area checker form
- [ ] `app/(public)/apply/page.tsx` — multi-step service application form
- [ ] `app/(public)/track/page.tsx` — application status tracker (by reference or email)

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

- [ ] `app/admin/layout.tsx`
- [ ] `app/admin/dashboard/page.tsx` — stats cards
- [ ] `app/admin/subscribers/page.tsx` — table; modal: view subscriber details, toggle status
- [ ] `app/admin/applications/page.tsx` — table; modal: view, approve/reject, schedule install, complete, activate
- [ ] `app/admin/billing/page.tsx` — table; modal: view bill; action: generate monthly bills (SweetAlert2 confirm), mark paid
- [ ] `app/admin/tickets/page.tsx` — table; modal: view thread, reply, update status
- [ ] `app/admin/announcements/page.tsx` — table; modal: create, edit, delete

---

## PHASE 13 — FRONTEND SUPERADMIN PORTAL

All CRUD in modals. Inherits all admin pages plus:

- [ ] `app/superadmin/layout.tsx`
- [ ] `app/superadmin/dashboard/page.tsx`
- [ ] `app/superadmin/plans/page.tsx` — table; modal: create, edit, toggle active, delete
- [ ] `app/superadmin/staff/page.tsx` — table; modal: create staff, edit, toggle status, delete
- [ ] `app/superadmin/settings/page.tsx` — grouped settings form (no modal needed, inline save)
- [ ] `app/superadmin/plan-changes/page.tsx` — table; modal: view request, approve/reject

---

## PHASE 14 — PAYMENT SCAFFOLD (Frontend)

- [ ] `components/customer/PaymentModal.tsx` — shows bill amount, method selector (Stripe/PayMongo), "Pay Now" button → calls `/api/customer/payments/initiate`; shows stub response with TODO note
- [ ] `app/customer/billing/page.tsx` — includes PaymentModal trigger per bill row

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

- [ ] All mail classes created
- [ ] All blade email templates created
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

> **Continue from: Phase 5 — Backend Controllers**
> Write the remaining controllers in this order:
> 1. `Customer\NotificationController`
> 2. `Customer\PlanChangeRequestController`
> 3. All 6 `Admin\` controllers
> 4. All 5 `SuperAdmin\` controllers
> Then move to Phase 6 (Services + Mail), Phase 7 (CORS), then Phase 8+ (Frontend).
