'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface TenantChromeGuardProps {
  tenant: string;
  header: React.ReactNode;
  footer: React.ReactNode;
  mobileBottomBar: React.ReactNode;
  children: React.ReactNode;
}

export default function TenantChromeGuard({
  tenant,
  header,
  footer,
  mobileBottomBar,
  children,
}: TenantChromeGuardProps) {
  const pathname = usePathname() || '/';
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const isHomePage =
    normalized === '/' ||
    normalized === `/sites/${tenant}` ||
    normalized === `/sites/${decodeURIComponent(tenant)}`;

  if (isHomePage) {
    return (
      <>
        {children}
        {mobileBottomBar}
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-accent/30 selection:text-primary">
      {header}
      <main className="flex-grow pb-16 lg:pb-0">{children}</main>
      {footer}
      {mobileBottomBar}
    </div>
  );
}
