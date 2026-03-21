import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function checkAdmin(supabase: any, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from('users').select('role').eq('id', userId).single();
  return data?.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await checkAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const admin = createAdminClient();
    const { data, count, error } = await admin
      .from('products')
      .select('*, category:categories(*)', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data, count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await checkAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await request.json();
    const admin = createAdminClient();
    const { data, error } = await admin.from('products').insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
