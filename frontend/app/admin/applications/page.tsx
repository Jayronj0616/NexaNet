'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ServiceApplication } from '@/types';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/ConfirmDialog';

export default function AdminApplications() {
    const [applications, setApplications] = useState<ServiceApplication[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<ServiceApplication | null>(null);

    // Context Action States
    const [isScheduling, setIsScheduling] = useState(false);
    const [technicianName, setTechnicianName] = useState('');
    const [installDate, setInstallDate] = useState('');

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/applications');
            setApplications(response.data.data || response.data);
        } catch (error) {
            console.error("Failed to load applications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleView = (app: ServiceApplication) => {
        setSelectedApp(app);
        setIsScheduling(false);
        setIsViewModalOpen(true);
    };

    const handleAction = async (actionPath: string, payload: any = {}, successMessage: string) => {
        if (!selectedApp) return;
        try {
            await api.put(`/admin/applications/${selectedApp.id}/${actionPath}`, payload);
            toast(successMessage, 'success');
            setIsViewModalOpen(false);
            fetchApplications(); // Refresh list
        } catch (error: any) {
            console.error(`Action ${actionPath} failed`, error);
            toast(error.response?.data?.message || 'Action failed', 'error');
        }
    };

    const renderActionButtons = () => {
        if (!selectedApp) return null;

        switch (selectedApp.status) {
            case 'pending':
                return (
                    <div className="flex gap-3">
                        <button onClick={() => handleAction('reject', { reason: 'Unserviceable area / Failed prerequisites' }, 'Application rejected')} className="px-4 py-2 bg-red-50 text-red-600 rounded text-sm font-medium hover:bg-red-100">Reject</button>
                        <button onClick={() => handleAction('approve', {}, 'Application approved')} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-500 shadow-sm">Approve</button>
                    </div>
                );
            case 'approved':
                return (
                    isScheduling ? (
                        <div className="flex flex-col gap-3 w-full bg-gray-50 p-4 rounded-md border">
                            <h4 className="text-sm font-medium">Schedule Installation</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Technician Name" className="text-sm rounded border-gray-300" value={technicianName} onChange={e => setTechnicianName(e.target.value)} />
                                <input type="datetime-local" className="text-sm rounded border-gray-300" value={installDate} onChange={e => setInstallDate(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => setIsScheduling(false)} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                                <button onClick={() => handleAction('schedule', { technician_name: technicianName, installation_date: installDate }, 'Installation scheduled')} disabled={!technicianName || !installDate} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded shadow-sm disabled:opacity-50">Confirm Schedule</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setIsScheduling(true)} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-500 shadow-sm">Schedule Installation</button>
                    )
                );
            case 'scheduled':
                return (
                    <button onClick={() => handleAction('complete', {}, 'Installation marked as complete')} className="px-4 py-2 bg-teal-600 text-white rounded text-sm font-medium hover:bg-teal-500 shadow-sm">Mark Installation Complete</button>
                );
            case 'installation_complete':
                return (
                 <button onClick={() => handleAction('activate', {}, 'Account activated successfully')} className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-500 shadow-sm">Activate & Create Account</button>
                );
            case 'active':
            case 'rejected':
            default:
                return (
                    <span className="text-sm text-gray-500 italic">No actions available for this status.</span>
                );
        }
    };

    const columns = [
        {
            header: 'Ref / Name',
            accessor: (row: ServiceApplication) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{row.reference_number}</span>
                    <span className="text-gray-500 text-xs">{row.first_name} {row.last_name}</span>
                </div>
            )
        },
        {
            header: 'Area',
            accessor: (row: ServiceApplication) => `${row.barangay}, ${row.city}`
        },
        {
            header: 'Status',
            accessor: (row: ServiceApplication) => <StatusBadge status={row.status} />
        },
        {
            header: 'Date Applied',
            accessor: (row: ServiceApplication) => formatDate(row.created_at)
        },
        {
            header: 'Action',
            accessor: (row: ServiceApplication) => (
                <button onClick={() => handleView(row)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Manage</button>
            )
        }
    ];

    if (loading && applications.length === 0) return <FullPageLoader />;

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Service Applications" 
                description="Process new internet applications from submission to activation."
            />

            <div className="mt-8">
                <DataTable
                    data={applications}
                    columns={columns}
                    keyExtractor={(row) => row.id.toString()}
                    searchPlaceholder="Search by reference, name, or area..."
                />
            </div>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Process Application" maxWidth="2xl">
                {selectedApp && (
                    <div className="space-y-6">
                        {/* Status Tracker */}
                        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border">
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Current Status</p>
                                <div className="mt-1">
                                    <StatusBadge status={selectedApp.status} className="text-base px-3 py-1" />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Reference No.</p>
                                <p className="mt-1 font-mono font-bold text-gray-900">{selectedApp.reference_number}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <h4 className="border-b pb-2 mb-3 text-sm font-semibold text-gray-900">Applicant Details</h4>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{selectedApp.first_name} {selectedApp.last_name}</dd></div>
                                    <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="text-gray-900">{selectedApp.email}</dd></div>
                                    <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd className="text-gray-900">{selectedApp.phone}</dd></div>
                                </dl>
                            </div>
                            
                            <div>
                                <h4 className="border-b pb-2 mb-3 text-sm font-semibold text-gray-900">Service Request</h4>
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd className="font-medium text-gray-900">{selectedApp.plan?.name}</dd></div>
                                    <div className="flex justify-between"><dt className="text-gray-500">Location</dt><dd className="text-gray-900 text-right">{selectedApp.address}<br/>{selectedApp.barangay}, {selectedApp.city}</dd></div>
                                </dl>
                            </div>
                        </div>

                        {/* Installation Details (if scheduled) */}
                        {selectedApp.technician_name && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Installation Schedule</h4>
                                <p className="text-sm text-blue-800">Assigned to: <strong>{selectedApp.technician_name}</strong> on {formatDate(selectedApp.installation_date)}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex justify-end">
                                {renderActionButtons()}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
