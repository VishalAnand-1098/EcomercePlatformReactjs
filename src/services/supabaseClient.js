import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'These must be added as Vercel Environment Variables and a new deployment must be triggered.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
