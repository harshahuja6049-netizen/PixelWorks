import { createServerSupabase } from '../utils/supabaseServer';
import Header from '../components/Header';
import Link from 'next/link';

export async function getServerSideProps(context) {
  const supabase = createServerSupabase(context.req, context.res);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user: session.user } };
}

export default function Home({ user }) {
  const actions = [
    { name: 'Add New Order', href: '/add-order', icon: '📦' },
    { name: 'Pending Orders', href: '/pending', icon: '⏳' },
    { name: 'In Progress', href: '/in-progress', icon: '⚙️' },
    { name: 'Completed Orders', href: '/completed', icon: '✅' },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="pw-container py-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Welcome, {user.email}</h1>
            <p className="mt-2 text-sm text-white/70">Manage your embroidery orders</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {actions.map((action) => (
              <Link key={action.name} href={action.href}>
                <div className="pw-card group cursor-pointer p-6 transition hover:-translate-y-0.5 hover:bg-white/5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-3xl">{action.icon}</div>
                  </div>
                  <h2 className="text-lg font-semibold text-white">{action.name}</h2>
                  <p className="mt-1 text-xs text-white/60">Open →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}