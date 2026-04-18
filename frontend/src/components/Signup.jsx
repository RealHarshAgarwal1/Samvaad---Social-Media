import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useSelector } from 'react-redux';

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
        // Clear error when user types
        if(errors[e.target.name]) {
            setErrors({...errors, [e.target.name]: null});
        }
    }

    const validateForm = () => {
        const newErrors = {};
        if (!input.username || input.username.length < 3) newErrors.username = "Username must be at least 3 characters";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) newErrors.email = "Please enter a valid email address";
        if (input.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        if(!validateForm()) return;

        try {
            setLoading(true);
            const res = await axios.post('/api/v1/user/register', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({ username: "", email: "", password: "" });
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
            <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl z-0"></div>
                <div className="z-10 text-center max-w-md">
                    <h1 className="text-4xl font-extrabold mb-4 tracking-tight logo-robotic">Samvaad</h1>
                    <h2 className="text-2xl font-bold mb-4">Join the Conversation</h2>
                    <p className="text-lg text-white/80 font-medium leading-relaxed">
                        Connect with friends, share your universe, and discover moments that matter.
                    </p>
                </div>
                <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-32 right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
                <form onSubmit={signupHandler} className="w-full max-w-md space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 lg:hidden logo-robotic">Samvaad</h2>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 hidden lg:block">Create Account</h2>
                        <p className="text-gray-500">Sign up to get started</p>
                    </div>

                    <div className="space-y-4 shadow-lg shadow-gray-100/50 bg-white p-8 rounded-2xl border border-gray-100">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="johndoe"
                                    value={input.username}
                                    onChange={changeEventHandler}
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.username ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>

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
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                                    className={`w-full pl-10 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold mt-4 shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </div>

                    <p className="text-center text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                            Login here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Signup