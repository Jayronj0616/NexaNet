'use client';

import React from 'react';
import { ApplicationTimelineItem } from '@/types';
import { CheckCircle2, Circle, Clock3, XCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface ApplicationTimelineProps {
    items: ApplicationTimelineItem[];
}

const timelineStyles: Record<ApplicationTimelineItem['state'], { icon: React.ElementType; iconClass: string; lineClass: string; cardClass: string }> = {
    completed: {
        icon: CheckCircle2,
        iconClass: 'text-green-600 bg-green-50',
        lineClass: 'bg-green-200',
        cardClass: 'border-green-100 bg-green-50/40',
    },
    current: {
        icon: Clock3,
        iconClass: 'text-blue-600 bg-blue-50',
        lineClass: 'bg-blue-200',
        cardClass: 'border-blue-100 bg-blue-50/50',
    },
    upcoming: {
        icon: Circle,
        iconClass: 'text-gray-400 bg-gray-100',
        lineClass: 'bg-gray-200',
        cardClass: 'border-gray-200 bg-gray-50',
    },
    failed: {
        icon: XCircle,
        iconClass: 'text-red-600 bg-red-50',
        lineClass: 'bg-red-200',
        cardClass: 'border-red-100 bg-red-50/50',
    },
};

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ items }) => {
    return (
        <div className="space-y-4">
            {items.map((item, index) => {
                const styles = timelineStyles[item.state];
                const Icon = styles.icon;
                const isLast = index === items.length - 1;

                return (
                    <div key={item.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.iconClass}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            {!isLast && <div className={`mt-2 h-full min-h-8 w-0.5 ${styles.lineClass}`} />}
                        </div>
                        <div className={`flex-1 rounded-xl border px-4 py-4 shadow-sm ${styles.cardClass}`}>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">{item.label}</h4>
                                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                                </div>
                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {item.timestamp ? formatDateTime(item.timestamp) : 'Waiting'}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
