'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SupportTicket, TicketReply } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/ConfirmDialog';
import { MessageSquare, Send } from 'lucide-react';

export default function AdminTickets() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    // View/Reply Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replies, setReplies] = useState<TicketReply[]>([]);
    const [newReply, setNewReply] = useState('');
    const [replying, setReplying] = useState(false);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/tickets');
            setTickets(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleView = async (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsViewModalOpen(true);
        try {
            const response = await api.get(`/admin/tickets/${ticket.id}`);
            // Assuming the endpoint returns { ticket, replies }
            // Since we didn't implement the exact show method response yet, guessing structure based on standard conventions
            setReplies(response.data.replies || response.data.ticket?.replies || []);
            // Update selected ticket with fresh data if present
            if (response.data.ticket) setSelectedTicket(response.data.ticket);
            else if (response.data.id) setSelectedTicket(response.data);
        } catch (error) {
            console.error('Failed to load thread', error);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        if (!selectedTicket) return;
        try {
            await api.put(`/admin/tickets/${selectedTicket.id}/status`, { status });
            toast(`Ticket status updated to ${status}`, 'success');
            setSelectedTicket({ ...selectedTicket, status });
            fetchTickets(); // Refresh list to reflect badge change
        } catch (error) {
            console.error('Failed to update status', error);
            toast('Failed to update status', 'error');
        }
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket || !newReply.trim()) return;

        setReplying(true);
        try {
            // Scaffold endpoint assuming it matches typical conventions
            await api.post(`/admin/tickets/${selectedTicket.id}/reply`, { message: newReply });
            toast('Reply sent successfully', 'success');
            setNewReply('');
            // Refresh thread
            handleView(selectedTicket);
            fetchTickets();
        } catch (error: any) {
            console.error('Failed to send reply', error);
            toast(error.response?.data?.message || 'Failed to send reply', 'error');
        } finally {
            setReplying(false);
        }
    };

    const columns = [
        {
            header: 'Ticket ID',
            accessor: (row: SupportTicket) => <span className="font-semibold text-gray-900">TKT-{row.id.toString().padStart(4, '0')}</span>
        },
        {
            header: 'Subject',
            accessor: (row: SupportTicket) => <div className="max-w-xs truncate text-gray-900 font-medium">{row.subject}</div>
        },
        {
            header: 'Customer',
            accessor: (row: SupportTicket) => row.user ? `${row.user.first_name} ${row.user.last_name}` : 'Unknown'
        },
        {
            header: 'Priority',
            accessor: (row: SupportTicket) => (
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    row.priority === 'urgent' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                    row.priority === 'high' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                    row.priority === 'medium' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                    'bg-gray-50 text-gray-600 ring-gray-600/20'
                }`}>
                    {row.priority.charAt(0).toUpperCase() + row.priority.slice(1)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (row: SupportTicket) => <StatusBadge status={row.status} />
        },
        {
            header: 'Last Updated',
            accessor: (row: SupportTicket) => formatDate(row.updated_at)
        },
        {
            header: 'Action',
            accessor: (row: SupportTicket) => (
                <button onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" /> View Thread
                </button>
            )
        }
    ];

    if (loading && tickets.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Support Tickets" 
                description="Manage customer technical and billing support requests."
            />

            <div className="mt-8">
                <DataTable
                    data={tickets}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search tickets..."
                />
            </div>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Ticket TKT-${selectedTicket?.id.toString().padStart(4, '0')}`} maxWidth="2xl">
                {selectedTicket && (
                    <div className="flex flex-col h-[600px] overflow-hidden">
                        {/* Header Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border flex justify-between items-start flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Posted by <span className="font-medium text-gray-900">{selectedTicket.user?.first_name} {selectedTicket.user?.last_name}</span> on {formatDate(selectedTicket.created_at)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={selectedTicket.status} />
                                <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                    Change Status: 
                                    <select 
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusUpdate(e.target.value)}
                                        className="text-xs rounded border-gray-300 py-1"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Thread */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                            {/* Original Message (assuming it's stored on the ticket or as the first reply, standardizing as a synthetic reply here) */}
                            <div className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-gray-600">{selectedTicket.user?.first_name?.charAt(0)}</span>
                                </div>
                                <div className="bg-white border rounded-lg p-3 w-full shadow-sm">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTicket.description || '(Original message)'}</p>
                                </div>
                            </div>

                            {/* Replies */}
                            {replies.map((reply) => (
                                <div key={reply.id} className={`flex gap-4 ${reply.is_staff_reply ? 'flex-row-reverse' : ''}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${reply.is_staff_reply ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                        <span className={`text-xs font-medium ${reply.is_staff_reply ? 'text-white' : 'text-gray-600'}`}>
                                            {reply.is_staff_reply ? 'S' : reply.user?.first_name?.charAt(0) || 'C'}
                                        </span>
                                    </div>
                                    <div className={`rounded-lg p-3 max-w-[85%] text-sm ${reply.is_staff_reply ? 'bg-blue-50 border border-blue-100 text-blue-900' : 'bg-white border text-gray-900 shadow-sm'}`}>
                                         {reply.message}
                                         <p className={`text-[10px] mt-2 ${reply.is_staff_reply ? 'text-blue-500 text-right' : 'text-gray-400'}`}>
                                             {formatDate(reply.created_at)}
                                         </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Form */}
                        {selectedTicket.status !== 'closed' && (
                            <div className="mt-auto border-t pt-4 bg-white flex-shrink-0">
                                <form onSubmit={handleReplySubmit} className="flex gap-3">
                                    <textarea
                                        rows={2}
                                        className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 resize-none"
                                        placeholder="Type your reply here..."
                                        value={newReply}
                                        onChange={(e) => setNewReply(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={replying || !newReply.trim()}
                                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
