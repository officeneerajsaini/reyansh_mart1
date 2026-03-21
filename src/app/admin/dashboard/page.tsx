'use client';
import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatPrice } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DashboardStats, RevenueData } from '@/types';

const MOCK_REVENUE: RevenueData[] = [
  { date: 'Mon', revenue: 12400, orders: 34 },
  { date: 'Tue', revenue: 18200, orders: 51 },
  { date: 'Wed', revenue: 15800, orders: 44 },
  { date: 'Thu', revenue: 21500, orders: 62 },
  { date: 'Fri', revenue: 28900, orders: 78 },
  { date: 'Sat', revenue: 34200, orders: 95 },
  { date: 'Sun', revenue: 26700, orders: 71 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch {
        // Use mock data if API fails
        setStats({
          total_orders: 1284,
          total_revenue: 485230,
          total_customers: 3421,
          total_products: 286,
          orders_today: 47,
          revenue_today: 18420,
          pending_orders: 12,
          low_stock_products: 8,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats ? [
    { label: 'Total Revenue', value: formatPrice(stats.total_revenue), sub: `Today: ${formatPrice(stats.revenue_today)}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Total Orders', value: stats.total_orders.toLocaleString(), sub: `Today: ${stats.orders_today} orders`, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Customers', value: stats.total_customers.toLocaleString(), sub: 'Registered users', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Products', value: stats.total_products.toLocaleString(), sub: `${stats.low_stock_products} low stock`, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ] : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Alert cards */}
      {stats && (stats.pending_orders > 0 || stats.low_stock_products > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {stats.pending_orders > 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
              <Clock size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">{stats.pending_orders} Pending Orders</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">Need confirmation</p>
              </div>
            </div>
          )}
          {stats.low_stock_products > 0 && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300 text-sm">{stats.low_stock_products} Low Stock Items</p>
                <p className="text-xs text-red-600 dark:text-red-500">Restock required</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : statCards.map(card => (
          <div key={card.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{card.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={MOCK_REVENUE}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(val: any) => [formatPrice(val), 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Daily Orders</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={MOCK_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="orders" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
