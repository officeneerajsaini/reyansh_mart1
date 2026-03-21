import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });
    const { data, error } = await supabase
      .from('reviews')
      .select(`*, user:users(id, full_name, avatar_url)`)
      .eq('product_id', product_id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    // Check if user bought this product
    const { count } = await supabase
      .from('order_items')
      .select('id', { count: 'exact' })
      .eq('product_id', body.product_id)
      .in('order_id', supabase.from('orders').select('id').eq('user_id', user.id).eq('status', 'delivered'));

    const { data, error } = await supabase.from('reviews').insert({
      ...body, user_id: user.id, is_verified_purchase: (count ?? 0) > 0,
    }).select().single();
    if (error) throw error;

    // Update product avg_rating
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('product_id', body.product_id);
    if (reviews) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await supabase.from('products').update({ avg_rating: avg, review_count: reviews.length }).eq('id', body.product_id);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
