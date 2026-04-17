import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');
    const hasCalledAPI = useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (hasCalledAPI.current) return;
            hasCalledAPI.current = true;

            if (!token) {
                setStatus('error');
                setMessage('Invalid or missing verification token.');
                return;
            }

            try {
                const res = await axios.get(`/api/v1/user/verify-email?token=${token}`);
                if (res.data.success) {
                    setStatus('success');
                    setMessage(res.data.message);
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Token may be expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center space-y-6">
                <div className="flex justify-center mb-6">
                    {status === 'loading' && <Loader2 className="h-16 w-16 animate-spin text-blue-500" />}
                    {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
                    {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800">
                    {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}
                </h2>
                
                <p className="text-gray-600">{message}</p>
                
                <div className="mt-8 pt-4">
                    {status === 'success' && (
                        <Link to="/login">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6">
                                Proceed to Login
                            </Button>
                        </Link>
                    )}
                    {status === 'error' && (
                        <Link to="/signup">
                            <Button variant="outline" className="w-full rounded-full py-6 mt-4">
                                Back to Signup
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
