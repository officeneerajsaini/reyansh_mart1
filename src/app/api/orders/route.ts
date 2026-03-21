import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/utils/format';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, product:products(name, images, slug))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { items, address, payment_method, razorpay_order_id, razorpay_payment_id } = body;

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity, 0);
    const delivery_fee = subtotal >= 499 ? 0 : 49;
    const total = subtotal + delivery_fee;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: generateOrderNumber(),
        user_id: user.id,
        status: payment_method === 'cod' ? 'confirmed' : 'confirmed',
        payment_method,
        payment_status: payment_method === 'cod' ? 'pending' : 'paid',
        razorpay_order_id: razorpay_order_id || null,
        razorpay_payment_id: razorpay_payment_id || null,
        subtotal,
        discount: 0,
        delivery_fee,
        total,
        address: {
          full_name: address.full_name,
          phone: address.phone,
          address_line1: address.address_line1,
          address_line2: address.address_line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        },
        notes: address.notes || null,
        estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product?.name ?? '',
      product_image: item.product?.images?.[0] ?? '',
      quantity: item.quantity,
      unit_price: item.product?.price ?? 0,
      total_price: (item.product?.price ?? 0) * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Clear server-side cart if exists
    await supabase.from('cart').delete().eq('user_id', user.id);

    return NextResponse.json({ data: order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
