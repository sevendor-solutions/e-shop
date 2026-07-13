import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Store, Truck, DollarSign, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';

const settingsSchema = z.object({
  storeName: z.string().min(1, 'Store Name is required'),
  storeEmail: z.string().min(1, 'Email is required').email('Invalid email address'),
  currency: z.string().min(1, 'Currency symbol is required'),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
  shippingFee: z.number().min(0, 'Shipping fee cannot be negative'),
  freeShippingThreshold: z.number().min(0, 'Free shipping threshold cannot be negative'),
  maintenanceMode: z.boolean().default(false)
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any
  });

  useEffect(() => {
    adminService.getSettings().then((data) => {
      reset({
        storeName: data.storeName,
        storeEmail: data.storeEmail,
        currency: data.currency,
        taxRate: data.taxRate,
        shippingFee: data.shippingFee,
        freeShippingThreshold: data.freeShippingThreshold,
        maintenanceMode: data.maintenanceMode
      });
      setLoading(false);
    });
  }, [reset]);

  const handleFormSubmit = async (values: SettingsFormValues) => {
    try {
      setLoading(true);
      const updated = await adminService.updateSettings(values as any);
      reset(updated);
      toast.success('Store settings saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 text-left">
        <Skeleton height={40} />
        <Skeleton height={180} />
        <Skeleton height={180} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-extrabold text-slate-805 dark:text-slate-100 font-heading">Global Settings</h1>
        <p className="text-sm text-slate-400">Configure global currencies, taxation scales, and shipping guidelines.</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 w-full">
        
        {/* General Store Details */}
        <div className="bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-5 pt-1">
            <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex items-center justify-center">
              <Store size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-150">General Store Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Store Name" placeholder="E-Shop Inc" error={errors.storeName?.message} {...register('storeName')} />
            <Input label="Notification Email" placeholder="store@example.com" error={errors.storeEmail?.message} {...register('storeEmail')} />
          </div>
        </div>

        {/* Financial and taxation configurations */}
        <div className="bg-white dark:bg-slate-800/80 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-5 pt-1">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center">
              <DollarSign size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-150">Taxation & Currency</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-400 uppercase tracking-wider">
                Store Currency Symbol
              </label>
              <select
                className="w-full px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none dark:text-slate-100"
                {...register('currency')}
              >
                <option value="USD">USD ($) - US Dollars</option>
                <option value="EUR">EUR (€) - Euros</option>
                <option value="GBP">GBP (£) - British Pounds</option>
              </select>
            </div>

            <Input
              label="Standard Sales Tax Rate (%)"
              type="number"
              step="0.1"
              error={errors.taxRate?.message}
              {...register('taxRate', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Shipping Configurations */}
        <div className="bg-white dark:bg-slate-800/80 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-5 pt-1">
            <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center">
              <Truck size={16} />
            </span>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-150">Shipping Configurations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Flat Shipping Fee ($)"
              type="number"
              step="0.01"
              error={errors.shippingFee?.message}
              {...register('shippingFee', { valueAsNumber: true })}
            />
            <Input
              label="Free Shipping Order Threshold ($)"
              type="number"
              error={errors.freeShippingThreshold?.message}
              {...register('freeShippingThreshold', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Advanced flags */}
        <div className="bg-white dark:bg-slate-800/80 border border-purple-100 dark:border-purple-900/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500" />
          
          <div className="flex items-start gap-3.5 pt-1">
            <span className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-500 flex items-center justify-center mt-0.5 flex-shrink-0">
              <ShieldAlert size={16} />
            </span>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <label className="flex items-center gap-2.5 font-bold text-sm text-slate-700 dark:text-slate-350 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary focus:ring-primary/40 w-4.5 h-4.5 cursor-pointer"
                  {...register('maintenanceMode')}
                />
                Enable Store Maintenance Mode
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                If enabled, public storefront pages will render a clean offline message. Administrative staff members can still access dashboard portals.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="flex justify-end gap-3 mt-2 pr-1">
          <Button
            type="submit"
            disabled={!isDirty}
            leftIcon={<Save size={16} />}
          >
            Save Settings
          </Button>
        </div>

      </form>
    </div>
  );
}
