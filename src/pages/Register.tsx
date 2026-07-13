import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Mail, Eye, EyeOff, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const registerSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { login, loading, error, setError, setLoading } = useAuthStore();
  
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as any
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.register(data.name, data.email);
      login(result.user, result.token, true);
      
      toast.success('Account created successfully! Welcome to E-Shop.');
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[75svh] w-full flex items-center justify-center bg-cover bg-center relative py-16 px-6" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=1600&auto=format&fit=crop&q=80')" }}
    >
      {/* Dark overlay backdrop blur */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-0" />
      
      {/* Form Container Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 backdrop-blur-md text-left">
        
        {/* Title */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-slate-805 dark:text-white font-heading">
            Create Free Account
          </h1>
          <p className="text-xs text-slate-450">Join us today to track orders, coupons, and wishlist alerts.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {error && (
            <div className="p-3.5 bg-[#1c1c1e] border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Name input */}
          <div className="relative">
            <Input
              label="Full Name"
              placeholder="Robert Smith"
              error={errors.name?.message}
              className="pl-10"
              {...register('name')}
            />
            <User className="absolute left-3.5 bottom-3 text-slate-455" size={16} />
          </div>

          {/* Email input */}
          <div className="relative">
            <Input
              label="Email Address"
              placeholder="robert@example.com"
              error={errors.email?.message}
              className="pl-10"
              {...register('email')}
            />
            <Mail className="absolute left-3.5 bottom-3 text-slate-455" size={16} />
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

          {/* Confirm Password input */}
          <div className="relative">
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              className="pl-10"
              {...register('confirmPassword')}
            />
            <Lock className="absolute left-3.5 bottom-3 text-slate-455" size={16} />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full mt-2 font-bold py-2.5"
          >
            Create Account
          </Button>
        </form>

        {/* Redirect login */}
        <div className="text-center text-xs font-semibold text-slate-455">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
