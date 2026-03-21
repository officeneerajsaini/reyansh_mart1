'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Truck, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils/format';
import { checkoutSchema } from '@/lib/validations/checkout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CheckoutForm } from '@/types';

declare global { interface Window { Razorpay: any; } }

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: 'razorpay' },
  });

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) { toast.error('Your cart is empty'); return; }
    setLoading(true);

    try {
      if (paymentMethod === 'razorpay') {
        // Create Razorpay order
        const orderRes = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, items, address: data }),
        });
        const orderData = await orderRes.json();
        if (!orderData.id) throw new Error('Failed to create payment order');

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: 'INR',
          name: 'FreshMart',
          description: 'Grocery Order',
          order_id: orderData.id,
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, address: data, items }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.orderId) {
              clearCart();
              toast.success('Order placed successfully!');
              router.push(`/orders/${verifyData.orderId}`);
            }
          },
          prefill: { name: data.full_name, contact: data.phone },
          theme: { color: '#22c55e' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, address: data, payment_method: 'cod' }),
        });
        const orderData = await res.json();
        if (orderData.data?.id) {
          clearCart();
          toast.success('Order placed successfully!');
          router.push(`/orders/${orderData.data.id}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left – Address + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin size={18} className="text-brand-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Delivery Address</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="John Doe" error={errors.full_name?.message} {...register('full_name')} />
                <Input label="Phone Number" placeholder="9876543210" error={errors.phone?.message} {...register('phone')} />
                <div className="sm:col-span-2">
                  <Input label="Address Line 1" placeholder="Flat/House No, Street" error={errors.address_line1?.message} {...register('address_line1')} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Address Line 2 (Optional)" placeholder="Landmark, Area" {...register('address_line2')} />
                </div>
                <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register('city')} />
                <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register('state')} />
                <Input label="Pincode" placeholder="400001" error={errors.pincode?.message} {...register('pincode')} />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={18} className="text-brand-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h2>
              </div>
              <div className="space-y-3">
                {[
                  { value: 'razorpay', label: 'Online Payment', desc: 'UPI, Cards, Net Banking, Wallets', icon: '💳' },
                  { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                ].map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value as any)} className="text-brand-500" />
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order notes */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Notes (Optional)</h2>
              <textarea {...register('notes')} rows={3} placeholder="Any special instructions for delivery..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
          </div>

          {/* Right – Summary */}
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product?.name ?? ''} fill className="object-cover" sizes="48px" />
                      ) : <div className="w-full h-full flex items-center justify-center">🛒</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">× {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPrice((item.product?.price ?? 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-500 font-medium' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
              <Button type="submit" fullWidth size="lg" loading={loading} className="mt-5 gap-2">
                <CheckCircle size={18} />
                {paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ${formatPrice(total)}`}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
