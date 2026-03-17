'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/components/ui/ConfirmDialog';
import { Plan } from '@/types';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';

function ApplyForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState<Plan[]>([]);
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        barangay: searchParams.get('barangay') || '',
        city: searchParams.get('city') || '',
        province: '',
        plan_id: searchParams.get('plan') || '',
    });

    useEffect(() => {
        // Fetch active plans to populate the select dropdown
        const fetchPlans = async () => {
            try {
                const response = await api.get('/public/plans');
                setPlans(response.data.data || response.data);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            }
        };
        fetchPlans();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        // Simple validation before proceeding
        if (step === 1 && (!formData.first_name || !formData.last_name || !formData.email || !formData.phone)) {
            toast('Please fill in all personal details', 'warning');
            return;
        }
        if (step === 2 && (!formData.address || !formData.barangay || !formData.city || !formData.province)) {
            toast('Please fill in your complete installation address', 'warning');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.plan_id) {
            toast('Please select a service plan', 'warning');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/public/applications', formData);
            
            toast('Application submitted successfully!', 'success');
            
            // Redirect to a success/tracking page using the reference number
            router.push(`/track?reference=${response.data.application.reference_number}`);
        } catch (error: any) {
            console.error('Application failed', error);
            toast(error.response?.data?.message || 'Submission failed. Please check your inputs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white px-6 py-8 shadow-xl sm:rounded-xl sm:px-12">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="overflow-hidden rounded-full bg-gray-200">
                    <div 
                        className="h-2 rounded-full bg-blue-600 transition-all duration-300 ease-in-out" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>
                <div className="mt-4 grid grid-cols-3 text-sm font-medium text-gray-500 text-center">
                    <div className={step >= 1 ? 'text-blue-600' : ''}>Personal Info</div>
                    <div className={step >= 2 ? 'text-blue-600' : ''}>Installation Address</div>
                    <div className={step >= 3 ? 'text-blue-600' : ''}>Plan Selection</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Info */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-gray-900">First name</label>
                                <input type="text" name="first_name" id="first_name" required value={formData.first_name} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-gray-900">Last name</label>
                                <input type="text" name="last_name" id="last_name" required value={formData.last_name} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                            <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">Phone number</label>
                            <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                )}

                {/* Step 2: Address */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Street Address (House No., Street name)</label>
                            <input type="text" name="address" id="address" required value={formData.address} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="barangay" className="block text-sm font-medium leading-6 text-gray-900">Barangay</label>
                                <input type="text" name="barangay" id="barangay" required value={formData.barangay} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">City / Municipality</label>
                                <input type="text" name="city" id="city" required value={formData.city} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="province" className="block text-sm font-medium leading-6 text-gray-900">Province</label>
                            <input type="text" name="province" id="province" required value={formData.province} onChange={handleChange} className="mt-2 block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                )}

                {/* Step 3: Plan Selection */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label htmlFor="plan_id" className="block text-sm font-medium leading-6 text-gray-900 font-semibold mb-4">Select Your Plan</label>
                            <div className="grid grid-cols-1 gap-4">
                                {plans.map((plan) => (
                                    <label 
                                        key={plan.id}
                                        className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                                            formData.plan_id == plan.id.toString() 
                                                ? 'border-blue-600 ring-1 ring-blue-600' 
                                                : 'border-gray-300'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="plan_id" 
                                            value={plan.id} 
                                            className="sr-only" 
                                            onChange={handleChange}
                                            checked={formData.plan_id == plan.id.toString()}
                                        />
                                        <span className="flex flex-1">
                                            <span className="flex flex-col">
                                                <span className="block text-sm font-medium text-gray-900">{plan.name}</span>
                                                <span className="mt-1 flex items-center text-sm text-gray-500">
                                                    Up to {plan.speed_mbps} Mbps symmetrical
                                                </span>
                                            </span>
                                        </span>
                                        <span className="mt-2 text-sm font-bold text-gray-900 sm:ml-4 sm:mt-0 sm:flex-col sm:text-right">
                                            ₱{plan.price} <span className="text-gray-500 font-normal text-xs">/mo</span>
                                        </span>
                                        
                                        <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${formData.plan_id == plan.id.toString() ? 'border-blue-600' : 'border-transparent'}`} aria-hidden="true"></span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                    {step > 1 ? (
                        <button type="button" onClick={prevStep} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors">
                            Back
                        </button>
                    ) : <div></div>}
                    
                    {step < 3 ? (
                        <button type="button" onClick={nextStep} className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
                            Continue
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="rounded-md bg-green-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 transition-colors transition-all transform hover:-translate-y-0.5">
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default function ApplyPage() {
    return (
        <div className="bg-gray-50 py-16 sm:py-24 min-h-[calc(100vh-4rem)]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center pb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Service Application</h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">
                        Please fill out the form below to apply for NexaNet internet service.
                    </p>
                </div>

                <div className="mx-auto max-w-2xl">
                    <Suspense fallback={<FullPageLoader />}>
                        <ApplyForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
