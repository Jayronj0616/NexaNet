import { User } from '@/types';

export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }
};

export const setUser = (user: User) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user));
    }
};

export const getUser = (): User | null => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    }
    return null;
};

export const isRole = (role: 'superadmin' | 'admin' | 'customer'): boolean => {
    const user = getUser();
    return user?.role === role;
};
