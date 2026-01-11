import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../api';

interface User {
    id: number;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await api.get('/check-session');
            if (res.data.loggedIn) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post('/login', { email, password });
            if (res.data.success) {
                setUser(res.data.user);
                return res.data;
            }
            throw new Error(res.data.error || 'Error al iniciar sesión');
        } catch (err: any) {
            const message = err.response?.data?.error || err.message || 'Error al conectar con el servidor';
            throw new Error(message);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
            setUser(null);
        } catch (err) {
            console.error("Error al cerrar sesión", err);
            setUser(null); // Forzar cierre de sesión en el frontend de todos modos
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
