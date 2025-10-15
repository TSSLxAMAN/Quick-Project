import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated on mount
        const initAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    const userData = await authService.getUserProfile();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    authService.logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            await authService.login(username, password);
            const userData = await authService.getUserProfile();
            setUser(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    };

    const register = async (userData) => {
        console.log(userData)
        try {
            await authService.register(userData);
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};