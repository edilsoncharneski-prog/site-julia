import { redirect } from 'next/navigation';
import { getCatalog } from '@/lib/catalog';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getStoreConfigAction } from './actions';
import { AdminClient } from './AdminClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }

  const [products, config] = await Promise.all([
    getCatalog(),
    getStoreConfigAction(),
  ]);

  return (
    <AdminClient
      initialProducts={products}
      initialConfig={config}
    />
  );
}
