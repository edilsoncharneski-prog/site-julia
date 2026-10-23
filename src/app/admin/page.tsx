import { getCatalog } from '@/lib/catalog';
import { getStoreConfigAction } from './actions';
import { AdminClient } from './AdminClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
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
