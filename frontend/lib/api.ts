import axios from 'axios';
import { getToken, removeToken } from './auth';

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const baseURL = configuredBaseUrl
    ? configuredBaseUrl.replace(/\/$/, '')
    : process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/api'
        : '/api';

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
