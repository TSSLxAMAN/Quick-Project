import api from './api';
import { jwtDecode } from 'jwt-decode';

class AuthService {
    // Login
    async login(username, password) {
        try {
            const response = await api.post('/auth/login/', {
                username,
                password,
            });

            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || { detail: 'Login failed' };
        }
    }

    // Register
    async register(userData) {
        console.log(userData)
        try {
            const response = await api.post('/auth/registration/', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { detail: 'Registration failed' };
        }
    }

    // Logout
    async logout() {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    }

    // Change Password
    async changePassword(oldPassword, newPassword1, newPassword2) {
        try {
            const response = await api.post('/auth/password/change/', {
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { detail: 'Password change failed' };
        }
    }

    // Reset Password Request
    async resetPasswordRequest(email) {
        try {
            const response = await api.post('/auth/password/reset/', {
                email,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { detail: 'Password reset request failed' };
        }
    }

    // Reset Password Confirm
    async resetPasswordConfirm(uid, token, newPassword1, newPassword2) {
        try {
            const response = await api.post('/auth/password/reset/confirm/', {
                uid,
                token,
                new_password1: newPassword1,
                new_password2: newPassword2,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { detail: 'Password reset confirmation failed' };
        }
    }

    // Get User Profile
    async getUserProfile() {
        try {
            const response = await api.get('/users/profile/');
            return response.data;
        } catch (error) {
            throw error.response?.data || { detail: 'Failed to fetch profile' };
        }
    }

    // Get Dashboard Data
    async getDashboardData() {
        try {
            const response = await api.get('/users/dashboard/');
            return response.data;
        } catch (error) {
            throw error.response?.data || { detail: 'Failed to fetch dashboard data' };
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('access_token');
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            // Check if token is expired
            return decoded.exp * 1000 > Date.now();
        } catch (error) {
            return false;
        }
    }

    // Get current user from token
    getCurrentUser() {
        const token = localStorage.getItem('access_token');
        if (!token) return null;

        try {
            return jwtDecode(token);
        } catch (error) {
            return null;
        }
    }

    // Get access token
    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    // Get refresh token
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }
}

export default new AuthService();