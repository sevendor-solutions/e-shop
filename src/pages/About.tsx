import React from 'react';
import { Card } from '../components/ui/Card';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-10 text-slate-700 dark:text-slate-300">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-heading">About E-Shop</h1>
        <p className="text-xs text-slate-450 uppercase tracking-widest font-semibold">Our Journey &amp; Values</p>
      </div>

      <div className="aspect-[2/1] rounded-3xl overflow-hidden bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80"
          alt="E-Shop Team Workspace"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Our Story</h2>
          <p>
            Founded in Limassol, Cyprus, E-Shop started as a visionary project to bridge the gap between premium consumer electronics and a seamless, high-speed online shopping experience. Over the years, we have grown into a multi-category marketplace.
          </p>
          <p>
            By designing layouts inspired by modern web architectures, we offer storefront interfaces that feel alive, interactive, and responsive on all devices.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Our Mission</h2>
          <p>
            We aim to deliver original, high-quality, and robust merchandise directly to our customers. Our core value is transparency — ensuring secure checkouts, flexible return options, and clear specifications.
          </p>
          <p>
            Our dedicated team is constantly working to source, catalog, and support products that elevate workspaces, styling wardrobes, and fitness routines.
          </p>
        </div>
      </div>

    </div>
  );
}
