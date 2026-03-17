import React from 'react';
import { PortalLayout } from '@/components/ui/PortalLayout';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <PortalLayout allowedRoles={['customer']}>
            {children}
        </PortalLayout>
    );
}
