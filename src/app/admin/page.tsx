'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Users, Package, TrendingUp, AlertTriangle, Clock, ArrowRight, BarChart2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils/format';
import type { DashboardStats, RevenueData } from '@/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => {
      setStats(d.stats);
      setRevenueData(d.revenueData || []);
      setLoading(false);
    });
  }, []);

  const STAT_CARDS = stats ? [
    { title: 'Total Revenue', value: formatPrice(stats.total_revenue), icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', change: `+${formatPrice(stats.revenue_today)} today` },
    { title: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950', change: `+${stats.orders_today} today` },
    { title: 'Customers', value: stats.total_customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950', change: 'Registered users' },
    { title: 'Products', value: stats.total_products, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950', change: `${stats.low_stock_products} low stock` },
  ] : [];

  const QUICK_LINKS = [
    { href: '/admin/products', label: 'Manage Products', icon: Package, badge: null },
    { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingBag, badge: stats?.pending_orders || null },
    { href: '/admin/users', label: 'View Users', icon: Users, badge: null },
    { href: '/admin/categories', label: 'Categories', icon: BarChart2, badge: null },
  ];

  return (
    <><Navbar /><CartDrawer />
    <main className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex gap-2">
          {stats?.pending_orders && stats.pending_orders > 0 && (
            <Link href="/admin/orders?status=pending">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-sm font-medium">
                <Clock className="h-4 w-4" />{stats.pending_orders} pending orders
              </div>
            </Link>
          )}
          {stats?.low_stock_products && stats.low_stock_products > 0 && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium">
              <AlertTriangle className="h-4 w-4" />{stats.low_stock_products} low stock
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-32 rounded-2xl" />) : (
          STAT_CARDS.map(card => (
            <div key={card.title} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.change}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Revenue (Last 7 Days)</h2>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick links */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {QUICK_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center">
                    <link.icon className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {link.badge && <Badge variant="warning" size="sm">{link.badge}</Badge>}
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main></>
  );
}
