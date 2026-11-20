import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[SIKEJA WARN] Supabase credentials (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY) are missing in environment variables. Please configure .env.local'
    );
  }
}

// Server-side Supabase client with Service Role Key for administrative bypassing of RLS
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseServiceKey || 'placeholder-service-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

