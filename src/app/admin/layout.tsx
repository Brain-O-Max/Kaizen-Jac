import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SITES, currentSiteId } from '@/lib/site';

export function generateMetadata(): Metadata {
  return {
    title: `${SITES[currentSiteId()].name} Admin`,
    robots: { index: false, follow: false },
  };
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen antialiased">{children}</div>;
}
