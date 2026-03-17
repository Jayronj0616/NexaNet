'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, 
    CreditCard, 
    Ticket, 
    Bell, 
    Settings, 
    Users, 
    FileText,
    Megaphone,
    Package,
    ArrowLeftRight
} from 'lucide-react';

export interface SidebarItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

interface SidebarProps {
    role: 'superadmin' | 'admin' | 'customer';
}

const getRoleNavigation = (role: string): SidebarItem[] => {
    switch (role) {
        case 'superadmin':
            return [
                { name: 'Dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard },
                { name: 'Plans', href: '/superadmin/plans', icon: Package },
                { name: 'Staff', href: '/superadmin/staff', icon: Users },
                { name: 'Plan Changes', href: '/superadmin/plan-changes', icon: ArrowLeftRight },
                { name: 'Settings', href: '/superadmin/settings', icon: Settings },
            ];
        case 'admin':
            return [
                { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Subscribers', href: '/admin/subscribers', icon: Users },
                { name: 'Applications', href: '/admin/applications', icon: FileText },
                { name: 'Billing', href: '/admin/billing', icon: CreditCard },
                { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
                { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
            ];
        case 'customer':
        default:
            return [
                { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
                { name: 'Billing', href: '/customer/billing', icon: CreditCard },
                { name: 'Tickets', href: '/customer/tickets', icon: Ticket },
                { name: 'Notifications', href: '/customer/notifications', icon: Bell },
            ];
    }
};

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    const pathname = usePathname();
    const navigation = getRoleNavigation(role);

    return (
        <div className="flex h-full flex-col overflow-y-auto border-r border-gray-200 bg-white">
            <div className="flex h-16 shrink-0 items-center px-6">
                <span className="text-2xl font-bold text-blue-600 tracking-tight">NexaNet <span className="text-gray-400 text-sm">{role}</span></span>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                            )}
                        >
                            <item.icon
                                className={cn(
                                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
};
