import React from 'react';
import { Badge } from './Badge';
import { formatStatus } from '@/lib/utils';

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    let variant: 'default' | 'success' | 'warning' | 'danger' | 'info' = 'default';

    switch (status.toLowerCase()) {
        case 'active':
        case 'paid':
        case 'resolved':
        case 'closed':
        case 'success':
        case 'approved':
        case 'activated':
        case 'installation_complete':
            variant = 'success';
            break;
        case 'pending':
        case 'unpaid':
        case 'open':
        case 'in_progress':
        case 'installation_scheduled':
            variant = 'warning';
            break;
        case 'overdue':
        case 'cancelled':
        case 'suspended':
        case 'failed':
        case 'rejected':
            variant = 'danger';
            break;
        case 'refunded':
            variant = 'info';
            break;
    }

    return (
        <Badge variant={variant} className={className}>
            {formatStatus(status)}
        </Badge>
    );
};
