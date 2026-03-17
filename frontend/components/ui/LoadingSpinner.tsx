import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <Loader2 className={cn("animate-spin text-blue-600", className)} />
    );
};

export const FullPageLoader = () => (
    <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
        <LoadingSpinner className="h-10 w-10" />
    </div>
);
