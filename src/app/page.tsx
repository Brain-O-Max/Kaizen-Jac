import type { Metadata } from 'next';
import { getContent } from '@/lib/content';
import SiteShell from '@/components/site/SiteShell';
import SeoSchema from '@/components/site/SeoSchema';

// Content is edited in the admin app, so read it on every request rather than at build time.
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { meta, businesses } = await getContent();
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    metadataBase: meta.siteUrl ? new URL(meta.siteUrl) : undefined,
    openGraph: {
      type: 'website',
      title: meta.title,
      description: meta.description,
      images: businesses[0]?.image ? [businesses[0].image] : undefined,
    },
  };
}

export default async function HomePage() {
  const siteData = await getContent();
  return (
    <>
      <SeoSchema siteData={siteData} />
      <SiteShell siteData={siteData} />
    </>
  );
}
