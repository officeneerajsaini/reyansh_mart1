import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersRes, usersRes, productsRes, todayOrdersRes, lowStockRes] = await Promise.all([
      admin.from('orders').select('total, status'),
      admin.from('users').select('id', { count: 'exact', head: true }),
      admin.from('products').select('id', { count: 'exact', head: true }),
      admin.from('orders').select('total').gte('created_at', today.toISOString()),
      admin.from('products').select('id', { count: 'exact', head: true }).lt('stock_quantity', 10).gt('stock_quantity', 0),
    ]);

    const orders = ordersRes.data ?? [];
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const todayOrders = todayOrdersRes.data ?? [];
    const revenueToday = todayOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);

    return NextResponse.json({
      total_orders: orders.length,
      total_revenue: totalRevenue,
      total_customers: usersRes.count ?? 0,
      total_products: productsRes.count ?? 0,
      orders_today: todayOrders.length,
      revenue_today: revenueToday,
      pending_orders: pendingOrders,
      low_stock_products: lowStockRes.count ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
