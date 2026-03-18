'use client';

import React from 'react';
import { ClipboardCheck, Clock3, MessageSquareText, UserCheck, XCircle } from 'lucide-react';
import { ServiceApplicationActivity } from '@/types';
import { formatDateTime, formatStatus } from '@/lib/utils';

interface ApplicationHistoryFeedProps {
    items: ServiceApplicationActivity[];
}

const activityIconMap: Record<string, React.ElementType> = {
    submitted: ClipboardCheck,
    approved: UserCheck,
    rejected: XCircle,
    installation_scheduled: Clock3,
    installation_completed: ClipboardCheck,
    activated: UserCheck,
    notes_updated: MessageSquareText,
};

export const ApplicationHistoryFeed: React.FC<ApplicationHistoryFeedProps> = ({ items }) => {
    if (items.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                No activity has been recorded for this application yet.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item) => {
                const Icon = activityIconMap[item.type] || Clock3;
                const actorLabel = item.actor_role ? `${item.actor_name} • ${formatStatus(item.actor_role)}` : item.actor_name;

                return (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
                        <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                                        <p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
                                    </div>
                                    <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        {formatDateTime(item.created_at)}
                                    </div>
                                </div>
                                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Recorded by {actorLabel}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
