'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface MobileNavigationProps {
  links: Array<{ label: string; href: string }>;
}

export default function MobileNavigation({ links }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-site-navigation"
        className="relative z-[60] flex min-h-11 min-w-11 items-center justify-center rounded-lg text-primary transition-colors hover:bg-slate-100 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <nav
            id="mobile-site-navigation"
            aria-label="Mobile navigation"
            className="fixed inset-x-0 top-0 z-[55] border-b border-slate-200 bg-white px-6 pb-7 pt-24 shadow-xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-widest text-slate-700 transition-colors hover:bg-accent/10 hover:text-accent dark:text-slate-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
