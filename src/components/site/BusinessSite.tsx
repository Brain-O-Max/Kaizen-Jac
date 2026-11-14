'use client';

import type { Business, SiteContent } from '@/lib/types';
import type { SiteConfig, SiteLink } from '@/lib/site';
import Navbar, { type NavLink } from './Navbar';
import BusinessHero from './BusinessHero';
import ProductCatalog from './ProductCatalog';
import BusinessSections from './BusinessSections';
import ContactSection from './ContactSection';
import Footer from './Footer';
import { THEMES } from './theme';

interface BusinessSiteProps {
  siteData: SiteContent;
  business: Business;
  site: SiteConfig;
  siteLinks: SiteLink[];
}

// One complete website: Kaizen Enterprise, Kaizen Design & Development or Kaizen Training Center.
export default function BusinessSite({ siteData, business, site, siteLinks }: BusinessSiteProps) {
  const theme = THEMES[site.theme];
  const hasProducts = Boolean(business.productCategories?.some((c) => c.items.length > 0));

  const links: NavLink[] = [
    { name: 'Overview', href: '#home' },
    ...(hasProducts ? [{ name: 'Products', href: '#products' }] : []),
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:text-white ${theme.selection}`}>
      <Navbar siteData={siteData} brand={{ name: site.name, initials: site.initials }} links={links} />

      <main>
        <BusinessHero business={business} theme={theme} hasProducts={hasProducts} />
        <ProductCatalog business={business} />
        <BusinessSections business={business} theme={theme} />
        <ContactSection siteData={siteData} businessName={business.name} />
      </main>

      <Footer
        siteData={siteData}
        business={business}
        brand={{ name: site.name, initials: site.initials }}
        links={links}
        siteLinks={siteLinks}
        currentSite={site.id}
      />
    </div>
  );
}
