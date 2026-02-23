import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../api/auth.service';

export const LoginView: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (isLogin) {
                await authService.login({ email, password });
            } else {
                await authService.register({ email, password, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
                // After registration, auto-login or redirect to login
                await authService.login({ email, password });
            }

            const user = await authService.getMe();
            setAuth(user);
            navigate('/');
        } catch (err: any) {
            console.error('Login Error:', err);
            const errorMessage = err.response?.data?.detail
                || err.message
                || 'Authentication failed. Please check your credentials.';
            setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-vitality-500 rounded-2xl flex items-center justify-center shadow-xl shadow-vitality-200 dark:shadow-none mb-4 animate-bounce-subtle">
                        <Utensils className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Vitality</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Your Personal Calorie Companion</p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-slate-100 dark:border-zinc-800 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="text-slate-500 dark:text-zinc-400 mb-8 text-sm">
                        {isLogin ? 'Enter your credentials to continue your health journey.' : 'Join us today and start tracking your path to a healthier life.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                    <Mail className="h-5 w-5 text-slate-400 dark:text-zinc-500 group-focus-within:text-vitality-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-vitality-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                                    <Lock className="h-5 w-5 text-slate-400 dark:text-zinc-500 group-focus-within:text-vitality-500" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-vitality-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-semibold text-vitality-600 hover:text-vitality-700"
                        >
                            {isLogin ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
