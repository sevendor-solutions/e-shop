import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, MapPin, Clock, Search, HelpCircle, Truck, RotateCcw, DollarSign, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data: ContactFormValues) => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Your message has been sent! We will contact you shortly.');
    reset();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching FAQs for "${searchQuery}"...`);
    }
  };

  const faqs = [
    {
      q: 'What is the standard delivery timeline?',
      a: 'Orders are processed within 24 hours. Domestic shipments are delivered within 3-5 business days. You can track your packages in real-time under the "Track Order" link in the top menu.'
    },
    {
      q: 'How do I return a product?',
      a: 'We offer a 30-day return window. Simply log in to your account, select the desired order from your Order History, and request a return label. Refunds are processed within 5 business days of package arrival.'
    },
    {
      q: 'Are import customs duties and taxes included?',
      a: 'Sales tax is calculated at checkout based on your local regulations. For international shipping, import duties and custom fees may be applied by local authorities and are the responsibility of the buyer.'
    },
    {
      q: 'Can I cancel my order after check out?',
      a: 'Orders can be cancelled or modified before they enter the "processing" status. Please reach out immediately to our hotline support if you need to intercept a package.'
    }
  ];

  const quickTopics = [
    { title: 'Shipping & Delivery', desc: 'Trace packages, calculate fees, and check dispatch dates.', icon: Truck, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { title: 'Returns & Refunds', desc: 'Initiate a return, download labels, and view return guidelines.', icon: RotateCcw, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Payments & Billing', desc: 'Manage payment methods, print invoices, and apply discount coupons.', icon: DollarSign, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    { title: 'Account Settings', desc: 'Reset password, edit profile settings, and modify notifications.', icon: Lock, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' }
  ];

  const contactInfo = [
    { name: 'Storefront Location', icon: MapPin, text: '101 Digital Ave, Limassol, Cyprus', actionText: 'Get Directions', action: () => toast.success('Opening Google Maps...') },
    { name: 'Support Phone', icon: Phone, text: '+357 25 123456', actionText: 'Call Hotline', action: () => window.open('tel:+35725123456') },
    { name: 'Email Inquiries', icon: Mail, text: 'support@eshop-cy.com', actionText: 'Send Email', action: () => window.open('mailto:support@eshop-cy.com') },
    { name: 'Working Hours', icon: Clock, text: 'Mon - Fri: 8:00 AM - 6:00 PM', actionText: 'Online Support Status', action: () => toast.success('Live Chat is currently online!') }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-12 text-slate-700 dark:text-slate-300 text-left">
      
      {/* Help Hero Header Search Panel */}
      <div className="bg-gradient-to-r from-[#1c1c1e] to-indigo-950 text-white rounded-3xl py-12 px-6 text-center shadow-lg relative overflow-hidden flex flex-col items-center justify-center gap-5">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative z-10 max-w-xl flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
            How can we help you today?
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Search our comprehensive knowledge base or reach out to support representatives.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg z-10">
          <input
            type="text"
            placeholder="Search help articles, shipping, returns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 placeholder-slate-450 rounded-2xl border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all text-xs sm:text-sm font-semibold shadow-md"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </form>
      </div>

      {/* Quick Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickTopics.map((topic, i) => {
          const Icon = topic.icon;
          return (
            <div 
              key={i}
              onClick={() => toast.success(`Viewing details for: ${topic.title}`)}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all duration-200 flex flex-col gap-3.5"
            >
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${topic.color} flex-shrink-0`}>
                <Icon size={16} />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{topic.title}</h3>
                <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">{topic.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section - Full Width */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3.5 mb-5">
          <HelpCircle size={18} className="text-primary" />
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-155 uppercase tracking-widest">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index}
                className="border border-slate-100 dark:border-slate-700/60 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-left transition-colors font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-550 dark:text-slate-400 font-semibold leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Balanced Bottom Grid (50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Contact Info Panels */}
        <div className="flex flex-col gap-5">
          <h2 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-widest pl-1">Support Channels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div 
                  key={info.name} 
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:-translate-y-0.5 transition-transform duration-200 min-h-[130px]"
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{info.name}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-450 font-semibold break-words leading-relaxed">{info.text}</p>
                    <button 
                      onClick={info.action}
                      className="text-[10px] text-primary hover:text-primary-hover font-bold hover:underline self-start cursor-pointer mt-auto pt-1"
                    >
                      {info.actionText} &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Message Form */}
        <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-500" />
          
          <div className="flex flex-col gap-1 mb-6 text-left pt-1">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-widest">
              Send Us a Message
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold">
              Can't find what you need? Open a support ticket, and our team will get back to you within 12 hours.
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <Input label="Name" placeholder="e.g. John Doe" error={errors.name?.message} {...register('name')} />
              <Input label="Email Address" placeholder="e.g. john@example.com" error={errors.email?.message} {...register('email')} />
            </div>

            <Input label="Subject" placeholder="e.g. Warranty inquiries" error={errors.subject?.message} {...register('subject')} />
            <Input label="Message" textarea rows={4} placeholder="Type message details here..." error={errors.message?.message} {...register('message')} />

            <div className="flex justify-end mt-2">
              <Button type="submit" isLoading={isSubmitting} size="sm" className="font-bold py-2 px-5">
                Send Message
              </Button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
