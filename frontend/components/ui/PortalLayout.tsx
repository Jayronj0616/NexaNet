'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { FullPageLoader } from './LoadingSpinner';

interface PortalLayoutProps {
    children: React.ReactNode;
    allowedRoles: Array<'superadmin' | 'admin' | 'customer'>;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children, allowedRoles }) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getUser();
        
        if (!user) {
            router.push('/login');
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            // Redirect based on actual role
            if (user.role === 'customer') router.push('/customer/dashboard');
            else if (user.role === 'admin') router.push('/admin/dashboard');
            else if (user.role === 'superadmin') router.push('/superadmin/dashboard');
            return;
        }

        setIsAuthorized(true);
        setLoading(false);
    }, [router, allowedRoles]);

    if (loading || !isAuthorized) {
        return <FullPageLoader />;
    }

    const user = getUser();

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar Desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col">
                <Sidebar role={user?.role as 'superadmin' | 'admin' | 'customer'} />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto focus:outline-none">
                    <div className="py-6 px-4 sm:px-6 md:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
