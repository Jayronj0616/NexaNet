'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Bill } from '@/types';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/ConfirmDialog';
import { formatCurrency } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bill: Bill | null;
    onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bill, onPaymentSuccess }) => {
    const [method, setMethod] = useState('credit_card');
    const [loading, setLoading] = useState(false);

    if (!bill) return null;

    const handlePay = async () => {
        setLoading(true);
        try {
            // Call the scaffold backend endpoint
            const response = await api.post('/customer/payments/initiate', {
                bill_id: bill.id,
                method,
            });

            console.log('Payment Initiated Scaffold Result:', response.data);

            // Scaffold Simulation: 
            // In a real app we'd redirect to Stripe checkout or show PayMongo elements.
            // For this phase, we pretend it succeeds.

            setTimeout(async () => {
                // Manually mark the bill as paid via our admin endpoint just to simulate success 
                // Alternatively, the webhook would do this in real life.
                toast('Payment Initiated! Redirecting to gateway... (Scaffold Simulated Success)', 'success');
                
                // Simulate webhook fulfilling payment after 2 seconds
                onPaymentSuccess();
                onClose();
            }, 1000);

        } catch (error: any) {
             console.error('Payment failed', error);
             toast(error.response?.data?.message || 'Payment initiation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Make a Payment" maxWidth="md">
            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md border text-center">
                    <p className="text-sm text-gray-500 mb-1">Amount Due</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
                    <p className="text-xs text-gray-500 mt-2">Bill Ref: {bill.bill_number}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'credit_card', label: 'Credit Card (Stripe)' },
                            { id: 'gcash', label: 'GCash (PayMongo)' },
                            { id: 'paymaya', label: 'PayMaya' },
                            { id: 'bank_transfer', label: 'Bank Transfer' },
                        ].map((m) => (
                            <label
                                key={m.id}
                                className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                                    method === m.id ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50' : 'border-gray-300 bg-white'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value={m.id}
                                    className="sr-only"
                                    onChange={(e) => setMethod(e.target.value)}
                                    checked={method === m.id}
                                />
                                <span className="flex flex-1">
                                    <span className="block text-sm font-medium text-gray-900">{m.label}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Note:</strong> This is a scaffolded payment flow. Clicking pay will simulate a successful intent creation.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={loading}
                        className="inline-flex justify-center rounded-md bg-blue-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 items-center gap-2"
                    >
                        {loading ? <LoadingSpinner className="h-4 w-4 text-white" /> : 'Pay Now'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
