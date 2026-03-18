'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Notification } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/ConfirmDialog';

export default function CustomerNotifications() {
    const router = useRouter();
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
            await api.patch(`/customer/notifications/${id}/read`);
            setNotifications((currentNotifications) => currentNotifications.map((notification) => (
                notification.id === id
                    ? { ...notification, is_read: true }
                    : notification
            )));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/customer/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            toast('All notifications marked as read', 'success');
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        if (notification.link) {
            router.push(notification.link);
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
                                className={`p-4 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : 'bg-white'} ${notification.link ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                onClick={() => void handleNotificationClick(notification)}
                            >
                                <div className="flex space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {notification.type === 'warning' || notification.type === 'error' ? (
                                            <AlertCircle className={`h-6 w-6 ${!notification.is_read ? 'text-amber-600' : 'text-gray-400'}`} />
                                        ) : notification.type === 'success' ? (
                                            <CheckCircle2 className={`h-6 w-6 ${!notification.is_read ? 'text-green-600' : 'text-gray-400'}`} />
                                        ) : (
                                            <Bell className={`h-6 w-6 ${!notification.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
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
                                        {notification.link && (
                                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-blue-600">
                                                Open related page
                                            </p>
                                        )}
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
