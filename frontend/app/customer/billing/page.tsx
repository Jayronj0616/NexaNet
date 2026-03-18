'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';

export default function CustomerBilling() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/customer/tickets');
    }, [router]);

    return <FullPageLoader />;
}
