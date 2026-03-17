import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const [user, setUserState] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const currentUser = getUser();
        setUserState(currentUser);
        setLoading(false);
    }, []);

    const logout = () => {
        removeToken();
        setUserState(null);
        router.push('/login');
    };

    return {
        user,
        loading,
        logout,
        isAuthenticated: !!user,
        isRole: (role: string) => user?.role === role
    };
}
