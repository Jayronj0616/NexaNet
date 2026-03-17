'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/ConfirmDialog';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export default function CustomerNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/customer/notifications');
            setNotifications(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/customer/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/customer/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast('All notifications marked as read', 'success');
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    if (loading && notifications.length === 0) return <FullPageLoader />;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PageHeader 
                title="Notifications" 
                description={`You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}.`}
                actionLabel={unreadCount > 0 ? "Mark all as read" : undefined}
                onAction={unreadCount > 0 ? markAllAsRead : undefined}
            />

            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-8">
                {notifications.length > 0 ? (
                    <ul role="list" className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <li 
                                key={notification.id} 
                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : 'bg-white'}`}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                            >
                                <div className="flex space-x-3 cursor-pointer">
                                    <div className="flex-shrink-0 mt-1">
                                        {notification.type === 'system' ? (
                                            <AlertCircle className={`h-6 w-6 ${!notification.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
                                        ) : notification.type === 'billing' ? (
                                            <Bell className={`h-6 w-6 ${!notification.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
                                        ) : (
                                            <CheckCircle2 className={`h-6 w-6 ${!notification.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline gap-2">
                                            <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500 whitespace-nowrap">
                                                {formatDate(notification.created_at)}
                                            </p>
                                        </div>
                                        <p className={`mt-1 text-sm ${!notification.is_read ? 'text-gray-800' : 'text-gray-500'}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="flex-shrink-0 self-center">
                                            <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12">
                        <Bell className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                        <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
