import type { ComponentProps } from 'react';
import Link from 'next/link';

// Page routes ("/enterprise", "/#about") use client-side navigation; "#section" links scroll within the current page.
export default function NavAnchor({ href, ...props }: ComponentProps<'a'> & { href: string }) {
  return href.startsWith('/') ? <Link href={href} {...props} /> : <a href={href} {...props} />;
}
