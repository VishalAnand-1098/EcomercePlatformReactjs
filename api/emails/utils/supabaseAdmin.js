import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase server credentials are not configured');
  }

  supabaseAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return supabaseAdmin;
}

export async function fetchOrderForEmail(orderId) {
  const supabase = getSupabaseAdmin();

  const { data: order, error: orderError } = await supabase
    .from('ecommerce_orders')
    .select(`
      *,
      ecommerce_users (
        name,
        email,
        phone
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from('ecommerce_order_items')
    .select(`
      *,
      ecommerce_products (
        name,
        image_url,
        price,
        discount_percentage
      )
    `)
    .eq('order_id', orderId);

  if (itemsError) throw itemsError;

  return { ...order, items: items || [] };
}
