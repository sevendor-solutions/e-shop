import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[60svh] flex flex-col items-center justify-center text-center px-6 gap-5">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-heading">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        The URL path you are attempting to visit does not exist or may have been moved.
      </p>
      <Link to="/" className="mt-2">
        <Button size="sm" className="font-bold">
          Return to Home
        </Button>
      </Link>
    </div>
  );
}
