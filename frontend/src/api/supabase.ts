import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast and loudly: an empty key produces confusing "No API key found in
  // request" 403s on every data call. This usually means the dev server was
  // started before .env was set — restart it (Vite only reads .env at startup).
  throw new Error(
    'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      'in frontend/.env, then RESTART the dev server (Vite reads .env only at startup).',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
