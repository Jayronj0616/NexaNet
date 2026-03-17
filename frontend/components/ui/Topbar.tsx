'use client';

import React from 'react';
import { LogOut, Bell, User as UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { removeToken, getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export const Topbar: React.FC = () => {
    const router = useRouter();
    const user = getUser();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            removeToken();
            router.push('/login');
        }
    };

    return (
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 justify-end">
                <div className="flex items-center space-x-4">
                    <button className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>
                    
                    <div className="relative flex items-center space-x-3 border-l pl-4 border-gray-200">
                        <div className="flex flex-col text-right">
                            <span className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</span>
                            <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <UserIcon className="h-5 w-5" />
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="ml-2 text-gray-500 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
