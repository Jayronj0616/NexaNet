'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Plan } from '@/types';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/public/plans');
                setPlans(response.data.data || response.data);
            } catch (error) {
                console.error('Failed to fetch plans', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    if (loading) return <FullPageLoader />;

    return (
        <div className="bg-gray-50 py-24 sm:py-32 min-h-screen">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Plans for every speed and need
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                    Choose an affordable plan that&apos;s packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
                </p>

                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-8 xl:gap-x-12">
                    {plans.map((plan, index) => {
                        const isPopular = index === 1;

                        return (
                            <div
                                key={plan.id}
                                className={`rounded-3xl p-8 ring-1 xl:p-10 transition-transform duration-300 hover:-translate-y-2 flex flex-col justify-between ${
                                    isPopular
                                        ? 'bg-gray-900 ring-gray-900 shadow-2xl relative'
                                        : 'bg-white ring-gray-200 shadow-xl'
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 -mr-2 -mt-2">
                                        <span className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-blue-500/10 shadow-sm">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center justify-between gap-x-4">
                                        <h3 className={`text-2xl font-bold leading-8 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                            {plan.name}
                                        </h3>
                                    </div>
                                    <p className={`mt-4 text-sm leading-6 ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>
                                        Up to {plan.speed_mbps} Mbps symmetrical.
                                    </p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className={`text-4xl font-bold tracking-tight ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                                            PHP {Number(plan.price).toLocaleString('en-PH', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                        <span className={`text-sm font-semibold leading-6 ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>/month</span>
                                    </p>
                                    <ul role="list" className={`mt-8 space-y-3 text-sm leading-6 ${isPopular ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {Array.isArray(plan.features)
                                            ? plan.features.map((feature, featureIdx) => (
                                                  <li key={featureIdx} className="flex gap-x-3">
                                                      <Check className={`h-6 w-5 flex-none ${isPopular ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                                                      {feature}
                                                  </li>
                                              ))
                                            : null}
                                        <li className="flex gap-x-3">
                                            <Check className={`h-6 w-5 flex-none ${isPopular ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                                            Free Installation
                                        </li>
                                    </ul>
                                </div>
                                <Link
                                    href={`/apply?plan=${plan.id}`}
                                    className={`mt-8 block rounded-full px-3 py-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors w-full ${
                                        isPopular
                                            ? 'bg-blue-500 text-white hover:bg-blue-400 focus-visible:outline-blue-500'
                                            : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                                    }`}
                                >
                                    Select Plan
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
