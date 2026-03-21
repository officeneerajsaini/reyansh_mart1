'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Order, OrderStatus } from '@/types';

const STATUS_STEPS: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_ICONS: Partial<Record<OrderStatus, any>> = {
  confirmed: CheckCircle, processing: Package, shipped: Truck, delivered: CheckCircle,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(d => setOrder(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Order not found</h2>
      <Link href="/orders" className="text-brand-500 hover:underline">Back to Orders</Link>
    </div>
  );

  const statusIdx = STATUS_STEPS.indexOf(order.status as any);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/orders" className="hover:text-brand-500">Orders</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 dark:text-white font-medium">{order.order_number}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Placed on {formatDate(order.created_at)}</p>
        </div>
        <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'} size="md">
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Tracking */}
      {!isCancelled && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Order Tracking</h2>
          <div className="relative">
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-4">
              {STATUS_STEPS.map((step, i) => {
                const done = statusIdx >= i;
                const Icon = STATUS_ICONS[step] || Clock;
                return (
                  <div key={step} className="flex items-center gap-4 relative">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${done ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className={`font-medium capitalize text-sm ${done ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>{step}</p>
                      {done && i === statusIdx && order.estimated_delivery && (
                        <p className="text-xs text-gray-500">Est. {formatDate(order.estimated_delivery)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {(order.order_items ?? []).map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-gray-800 flex-shrink-0">
                {item.product_image ? (
                  <Image src={item.product_image} alt={item.product_name} fill className="object-cover" sizes="56px" />
                ) : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">× {item.quantity} · {formatPrice(item.unit_price)} each</p>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{formatPrice(item.total_price)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Delivery</span>
            <span className={order.delivery_fee === 0 ? 'text-green-500 font-medium' : ''}>
              {order.delivery_fee === 0 ? 'FREE' : formatPrice(order.delivery_fee)}
            </span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-gray-800">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-brand-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Delivery Address</h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
            <p className="font-medium text-gray-900 dark:text-white">{order.address.full_name}</p>
            <p>{order.address.phone}</p>
            <p>{order.address.address_line1}</p>
            {order.address.address_line2 && <p>{order.address.address_line2}</p>}
            <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-brand-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Payment</h3>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Method: <span className="font-medium text-gray-900 dark:text-white">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</span></p>
            <p>Status: <span className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.payment_status}</span></p>
            {order.razorpay_payment_id && <p className="text-xs truncate">Ref: {order.razorpay_payment_id}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
