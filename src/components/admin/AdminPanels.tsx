'use client';

// Browser-side data loading for the static admin pages (the old versions read files on the server).
import { API, apiFetch, fetchSavedContent } from '@/lib/api';
import { defaultContentFor } from '@/lib/defaults';
import type { SiteId } from '@/lib/site';
import type { Inquiry, MediaFile } from '@/lib/types';
import { AdminLoading, useAdminData } from './AdminShell';
import ContentEditor from './ContentEditor';
import InquiryList from './InquiryList';
import MediaLibrary from './MediaLibrary';

export function ContentPanel({ siteId }: { siteId: SiteId }) {
  // Nothing saved yet: start from the defaults.
  const { data, error } = useAdminData(async () => (await fetchSavedContent()) ?? defaultContentFor(siteId));
  return data ? <ContentEditor initialContent={data} /> : <AdminLoading error={error} />;
}

export function MediaPanel() {
  const { data, error } = useAdminData(() => apiFetch<MediaFile[]>(API.uploads));
  return data ? <MediaLibrary initialFiles={data} /> : <AdminLoading error={error} />;
}

export function InquiriesPanel() {
  const { data, error } = useAdminData(() => apiFetch<Inquiry[]>(API.inquiries));
  return data ? <InquiryList initialInquiries={data} /> : <AdminLoading error={error} />;
}
