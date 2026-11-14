import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { SITES, currentSiteId, siteLinks, siteUrl } from '@/lib/site';
import BusinessSite from '@/components/site/BusinessSite';
import SeoSchema from '@/components/site/SeoSchema';

// Content is edited in the admin panel, so read it on every request rather than at build time.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { meta, businesses } = await getContent();
  const site = SITES[currentSiteId()];
  const business = businesses.find((b) => b.id === site.businessId);
  const url = siteUrl(site.id);
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    metadataBase: new URL(url),
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: meta.title,
      description: meta.description,
      images: business?.image ? [business.image] : undefined,
    },
  };
}

// Which of the three Kaizen websites is shown depends on this deployment's SITE setting (see src/lib/site.ts).
export default async function HomePage() {
  const siteData = await getContent();
  const site = SITES[currentSiteId()];
  const business = siteData.businesses.find((b) => b.id === site.businessId);
  if (!business) notFound();

  return (
    <>
      <SeoSchema siteData={siteData} business={business} site={site} siteUrl={siteUrl(site.id)} />
      <BusinessSite siteData={siteData} business={business} site={site} siteLinks={siteLinks()} />
    </>
  );
}
