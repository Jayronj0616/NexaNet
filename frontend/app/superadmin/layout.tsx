import React from 'react';
import { PortalLayout } from '@/components/ui/PortalLayout';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <PortalLayout allowedRoles={['superadmin']}>
            {children}
        </PortalLayout>
    );
}
