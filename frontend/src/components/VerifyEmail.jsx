import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState('loading');
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
        <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
            <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-10 text-center space-y-5 mx-4">
                <div className="flex justify-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        status === 'loading' ? 'bg-indigo-50' : status === 'success' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                        {status === 'loading' && <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />}
                        {status === 'success' && <CheckCircle2 className="h-10 w-10 text-green-500" />}
                        {status === 'error' && <XCircle className="h-10 w-10 text-red-500" />}
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900">
                    {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
                </h2>
                
                <p className="text-gray-500 text-sm">{message}</p>
                
                <div className="pt-4">
                    {status === 'success' && (
                        <Link to="/login">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 font-semibold shadow-sm">
                                Continue to Login
                            </Button>
                        </Link>
                    )}
                    {status === 'error' && (
                        <Link to="/signup">
                            <Button variant="outline" className="w-full rounded-xl h-11 border-gray-200">
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
