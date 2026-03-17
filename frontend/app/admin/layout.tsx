import React from 'react';
import { PortalLayout } from '@/components/ui/PortalLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <PortalLayout allowedRoles={['admin', 'superadmin']}>
            {children}
        </PortalLayout>
    );
}
