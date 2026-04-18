import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('/api/v1/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({ email: "", password: "" });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])
    
    return (
        <div className="flex w-screen h-screen bg-[#fafafa] overflow-hidden">
            {/* Left Side: Aesthetic Gradient & Copy */}
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl z-0"></div>
                <div className="z-10 text-center max-w-md">
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight logo-robotic">Samvaad</h1>
                    <h2 className="text-2xl font-bold mb-4">Welcome Back</h2>
                    <p className="text-lg text-white/80 font-medium leading-relaxed">
                        Sign in to continue exploring your world and connecting with your favorite people.
                    </p>
                </div>
                <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-32 left-16 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
                <form onSubmit={loginHandler} className="w-full max-w-md space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 lg:hidden logo-robotic">Samvaad</h2>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 hidden lg:block">Login</h2>
                        <p className="text-gray-500">Welcome back! Please enter your details.</p>
                    </div>

                    <div className="space-y-5 shadow-lg shadow-gray-100/50 bg-white p-8 rounded-2xl border border-gray-100">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={input.password}
                                    onChange={changeEventHandler}
                                    required
                                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                           <div className="flex items-center">
                              <input type="checkbox" id="remember" className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer" />
                              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">Remember me</label>
                           </div>
                           <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold mt-6 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </div>

                    <p className="text-center text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
                            Sign up here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login