'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FullPageLoader } from '@/components/ui/LoadingSpinner';

export default function AdminBilling() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/tickets');
    }, [router]);

    return <FullPageLoader />;
}
