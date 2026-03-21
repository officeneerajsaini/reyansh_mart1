'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/utils/format';
import type { Order, OrderStatus } from '@/types';

const STATUS_OPTS = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const STATUS_VARIANT: Record<string, 'default'|'success'|'warning'|'danger'|'info'> = {
  pending:'warning', confirmed:'info', processing:'info', shipped:'info', delivered:'success', cancelled:'danger', refunded:'default',
};

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const url = `/api/admin/orders${filterStatus ? `?status=${filterStatus}` : ''}`;
    setLoading(true);
    fetch(url).then(r => r.json()).then(d => { setOrders(d.data || []); setLoading(false); });
  }, [filterStatus]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(os => os.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Order status updated');
    } else toast.error('Failed to update status');
    setUpdating(null);
  };

  return (
    <><Navbar /><CartDrawer />
    <main className="container-max py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders ({orders.length})</h1>
        <div className="w-48">
          <Select
            options={[{ value: '', label: 'All Statuses' }, ...STATUS_OPTS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['Order #','Customer','Date','Items','Total','Status','Update Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? Array.from({length:8}).map((_,i) => (
                <tr key={i}><td colSpan={7} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
              )) : orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{(order as any).user?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{(order as any).user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.order_items?.length || 0}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[order.status] || 'default'}>{order.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main></>
  );
}

export default function AdminOrdersPage() {
  return <Suspense fallback={<div />}><AdminOrdersContent /></Suspense>;
}
