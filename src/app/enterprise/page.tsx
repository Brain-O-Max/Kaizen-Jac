import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/lib/content';
import { ENTERPRISE_ID } from '@/lib/types';
import EnterpriseShell from '@/components/site/EnterpriseShell';
import SeoSchema from '@/components/site/SeoSchema';

// Content is edited in the admin panel, so read it on every request rather than at build time.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { meta, umbrella, businesses } = await getContent();
  const business = businesses.find((b) => b.id === ENTERPRISE_ID);
  if (!business) return {};
  const title = `${business.name} — ${business.shortTitle} | ${umbrella.name}`;
  return {
    title,
    description: business.summary,
    metadataBase: meta.siteUrl ? new URL(meta.siteUrl) : undefined,
    alternates: { canonical: '/enterprise' },
    openGraph: {
      type: 'website',
      title,
      description: business.summary,
      images: business.image ? [business.image] : undefined,
    },
  };
}

export default async function EnterprisePage() {
  const siteData = await getContent();
  const business = siteData.businesses.find((b) => b.id === ENTERPRISE_ID);
  if (!business) notFound();

  return (
    <>
      <SeoSchema siteData={siteData} />
      <EnterpriseShell siteData={siteData} business={business} />
    </>
  );
}
