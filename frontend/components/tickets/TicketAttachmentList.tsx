'use client';

import React from 'react';
import { Download, Paperclip } from 'lucide-react';
import { SupportTicketAttachment } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface TicketAttachmentListProps {
    attachments: SupportTicketAttachment[];
    onDownload: (attachment: SupportTicketAttachment) => void | Promise<void>;
    downloadingId?: number | null;
}

export const TicketAttachmentList: React.FC<TicketAttachmentListProps> = ({
    attachments,
    onDownload,
    downloadingId,
}) => {
    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="mt-3 space-y-2">
            {attachments.map((attachment) => (
                <button
                    key={attachment.id}
                    type="button"
                    onClick={() => void onDownload(attachment)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="truncate">{attachment.original_name}</span>
                    </span>
                    <span className="ml-3 flex shrink-0 items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(attachment.size_bytes)}</span>
                        <Download className={`h-4 w-4 ${downloadingId === attachment.id ? 'animate-pulse text-blue-600' : ''}`} />
                    </span>
                </button>
            ))}
        </div>
    );
};
