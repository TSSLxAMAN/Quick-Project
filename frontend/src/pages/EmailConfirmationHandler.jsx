import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EmailConfirmationHandler = () => {
    const { key } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                // Call backend to confirm
                await api.get(`/users/confirm-email/${key}/`);
                setStatus('success');
                setTimeout(() => {
                    navigate('/email-verified');
                }, 1000);
            } catch (error) {
                setStatus('error');
                setTimeout(() => {
                    navigate('/login?error=invalid_token');
                }, 2000);
            }
        };

        if (key) {
            confirmEmail();
        }
    }, [key, navigate]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                {status === 'verifying' && (
                    <div className="text-gray-300 text-xl">
                        Verifying your email...
                    </div>
                )}
                {status === 'error' && (
                    <div className="text-red-400 text-xl">
                        Verification failed. Redirecting...
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailConfirmationHandler;