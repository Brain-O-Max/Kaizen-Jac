import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBuildContent } from '@/lib/build-content';
import { SITES, currentSiteId, siteLinks, siteUrl } from '@/lib/site';
import BusinessSite from '@/components/site/BusinessSite';
import SeoSchema from '@/components/site/SeoSchema';

// Built once into static HTML with the content available at build time; BusinessSite then loads the latest
// content saved in the online admin, so edits appear without a rebuild.
export async function generateMetadata(): Promise<Metadata> {
  const site = SITES[currentSiteId()];
  const { meta, businesses } = await getBuildContent(site.id);
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

// Which of the three Kaizen websites is built depends on the SITE setting (see src/lib/site.ts).
export default async function HomePage() {
  const site = SITES[currentSiteId()];
  const siteData = await getBuildContent(site.id);
  const business = siteData.businesses.find((b) => b.id === site.businessId);
  if (!business) notFound();

  return (
    <>
      <SeoSchema siteData={siteData} business={business} site={site} siteUrl={siteUrl(site.id)} />
      <BusinessSite initialSiteData={siteData} site={site} siteLinks={siteLinks()} />
    </>
  );
}
