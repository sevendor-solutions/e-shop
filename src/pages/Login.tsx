import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false)
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, setError, setLoading } = useAuthStore();
  
  const [showPassword, setShowPassword] = React.useState(false);
  const from = location.state?.from?.pathname || '/account';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: 'customer@eshop.com', password: 'password123', rememberMe: true }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(data.email, data.password);
      
      if (result.user.role === 'admin' || result.user.role === 'manager') {
        throw new Error('Access denied. Administrators must login via the Admin Portal.');
      }
      
      login(result.user, result.token, data.rememberMe);
      
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[75svh] w-full flex items-center justify-center bg-cover bg-center relative py-16 px-6" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80')" }}
    >
      {/* Dark overlay backdrop blur */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-0" />
      
      {/* Form Container Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 backdrop-blur-md text-left">
        
        {/* Title */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-slate-805 dark:text-white font-heading">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-slate-450">Welcome back! Please enter your details below.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {error && (
            <div className="p-3.5 bg-[#1c1c1e] border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Email input */}
          <div className="relative">
            <Input
              label="Email Address"
              placeholder="customer@eshop.com"
              error={errors.email?.message}
              className="pl-10"
              {...register('email')}
            />
            <Mail className="absolute left-3.5 bottom-3 text-slate-450" size={16} />
          </div>

          {/* Password input */}
          <div className="relative text-left">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              className="pl-10 pr-10"
              {...register('password')}
            />
            <Lock className="absolute left-3.5 bottom-3 text-slate-455" size={16} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 bottom-2.5 p-1 text-slate-400 hover:text-slate-205"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-semibold">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-primary focus:ring-primary/40 w-4 h-4 cursor-pointer"
                {...register('rememberMe')}
              />
              Remember Me
            </label>
            <Link
              to="/forgot-password"
              className="font-bold text-primary hover:underline hover:text-primary-hover"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full mt-2 font-bold py-2.5"
          >
            Sign In
          </Button>
        </form>
        
        {/* Credentials hints */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-[10px] flex flex-col gap-1 text-slate-500 font-semibold text-left">
          <span className="font-extrabold text-primary dark:text-blue-450 uppercase tracking-wider mb-0.5">Store Demo Login</span>
          <span>Customer: <strong>customer@eshop.com</strong> / password123</span>
        </div>

        {/* Redirect register */}
        <div className="text-center text-xs font-semibold text-slate-450">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-bold">
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
}
