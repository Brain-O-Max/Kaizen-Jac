export const metadata = {
  title: 'Kaizen JAC Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <div className="min-h-screen antialiased">{children}</div>;
}
