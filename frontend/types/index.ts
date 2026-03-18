export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'customer';
    phone?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
    is_active: boolean;
    created_at: string;
}

export interface Plan {
    id: number;
    name: string;
    speed_mbps: number;
    price: number;
    billing_cycle: string;
    features: string[];
    is_active: boolean;
    created_at: string;
}

export interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    status: 'active' | 'suspended' | 'cancelled';
    start_date: string;
    end_date?: string;
    next_billing_date: string;
    plan?: Plan;
    user?: User;
}

export interface Bill {
    id: number;
    user_id: number;
    subscription_id: number;
    bill_number: string;
    amount: number;
    billing_period_start: string;
    billing_period_end: string;
    due_date: string;
    status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
    paid_at?: string;
    payments?: Payment[];
    user?: User;
}

export interface Payment {
    id: number;
    bill_id: number;
    method: 'stripe' | 'paymongo' | 'bank_transfer' | 'cash';
    status: 'pending' | 'success' | 'failed' | 'refunded';
    transaction_reference?: string;
    created_at: string;
}

export interface ApplicationTimelineItem {
    key: string;
    label: string;
    description: string;
    state: 'completed' | 'current' | 'upcoming' | 'failed';
    timestamp?: string | null;
}

export interface ServiceApplicationActivity {
    id: number;
    type: string;
    title: string;
    description: string;
    actor_name: string;
    actor_role?: string | null;
    created_at: string;
    meta?: Record<string, unknown> | null;
}

export interface ServiceApplication {
    id: number;
    reference_number: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    barangay: string;
    city: string;
    province: string;
    plan_id: number;
    status: 'pending' | 'approved' | 'rejected' | 'scheduled' | 'installation_scheduled' | 'installation_complete' | 'active' | 'activated';
    rejection_reason?: string;
    notes?: string | null;
    technician_name?: string;
    installation_date?: string;
    reviewed_at?: string | null;
    scheduled_at?: string | null;
    installation_completed_at?: string | null;
    activated_at?: string | null;
    created_at: string;
    status_label?: string;
    status_description?: string;
    timeline?: ApplicationTimelineItem[];
    activities?: ServiceApplicationActivity[];
    plan?: Plan;
}

export interface SupportTicket {
    id: number;
    ticket_number: string;
    user_id: number;
    subject: string;
    description: string;
    category: 'application' | 'technical' | 'account' | 'general' | 'billing';
    priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assigned_to?: number;
    resolved_at?: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    attachments?: SupportTicketAttachment[];
    replies?: TicketReply[];
}

export interface TicketReply {
    id: number;
    ticket_id: number;
    user_id: number;
    message: string;
    is_staff_reply: boolean;
    created_at: string;
    user?: User;
    attachments?: SupportTicketAttachment[];
}

export interface SupportTicketAttachment {
    id: number;
    support_ticket_id: number;
    ticket_reply_id?: number | null;
    user_id: number;
    original_name: string;
    mime_type?: string | null;
    size_bytes: number;
    created_at: string;
}

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string | null;
    is_read: boolean;
    read_at?: string;
    created_at: string;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'banner' | 'modal' | 'feed' | 'info' | 'maintenance' | 'outage';
    is_published: boolean;
    published_at?: string;
    expires_at?: string;
}

export interface PlanChangeRequest {
    id: number;
    user_id: number;
    subscription_id: number;
    current_plan_id: number;
    requested_plan_id: number;
    type: 'upgrade' | 'downgrade';
    status: 'pending' | 'approved' | 'rejected';
    reason?: string;
    created_at: string;
    currentPlan?: Plan;
    requestedPlan?: Plan;
}
