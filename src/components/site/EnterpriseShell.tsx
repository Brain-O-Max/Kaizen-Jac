'use client';

import type { Business, SiteContent } from '@/lib/types';
import Navbar from './Navbar';
import EnterpriseHero from './EnterpriseHero';
import ProductCatalog from './ProductCatalog';
import TradeLines from './TradeLines';
import ContactSection from './ContactSection';
import Footer from './Footer';

// The Kaizen Enterprise page (/enterprise).
export default function EnterpriseShell({ siteData, business }: { siteData: SiteContent; business: Business }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-600 selection:text-white antialiased">
      <Navbar siteData={siteData} variant="enterprise" />

      <main>
        <EnterpriseHero business={business} />
        <ProductCatalog business={business} />
        <TradeLines business={business} />
        <ContactSection siteData={siteData} preselectedBusiness={business.name} />
      </main>

      <Footer siteData={siteData} variant="enterprise" />
    </div>
  );
}
