import { SITES, currentSiteId } from '@/lib/site';
import LoginForm from '@/components/admin/LoginForm';

export default function LoginPage() {
  const site = SITES[currentSiteId()];
  return <LoginForm siteName={site.name} initials={site.initials} />;
}
