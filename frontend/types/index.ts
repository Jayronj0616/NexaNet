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
    method: 'gcash' | 'paymaya' | 'credit_card' | 'bank_transfer' | 'cash';
    status: 'pending' | 'success' | 'failed' | 'refunded';
    transaction_reference?: string;
    created_at: string;
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
    technician_name?: string;
    installation_date?: string;
    created_at: string;
    plan?: Plan;
}

export interface SupportTicket {
    id: number;
    ticket_number: string;
    user_id: number;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assigned_to?: number;
    created_at: string;
    updated_at: string;
    user?: User;
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
}

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
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
