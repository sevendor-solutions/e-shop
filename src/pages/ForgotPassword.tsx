import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setLoading(true);
    try {
      const msg = await authService.forgotPassword(data.email);
      setSuccessMessage(msg);
      toast.success('Reset link dispatched.');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[75svh] w-full flex items-center justify-center bg-cover bg-center relative py-16 px-6" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508427953056-b00b8d78ef65?w=1600&auto=format&fit=crop&q=80')" }}
    >
      {/* Dark overlay backdrop blur */}
      <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-[2px] z-0" />
      
      {/* Form Container Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 backdrop-blur-md text-left">
        
        {/* Back to sign in */}
        <Link to="/login" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors text-left">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold text-slate-805 dark:text-white font-heading">
            Recover Password
          </h1>
          <p className="text-xs text-slate-450">We will send a reset password verification link to your email inbox.</p>
        </div>

        {successMessage ? (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <CheckCircle className="text-emerald-500" size={40} />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-205">Dispatched Successfully</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{successMessage}</p>
            <Link to="/login" className="w-full mt-2">
              <Button size="sm" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="relative text-left">
              <Input
                label="Email Address"
                placeholder="customer@eshop.com"
                error={errors.email?.message}
                className="pl-10"
                {...register('email')}
              />
              <Mail className="absolute left-3.5 bottom-3 text-slate-455" size={16} />
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full font-bold py-2.5 mt-2"
            >
              Send Reset Link
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}
