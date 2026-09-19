import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let serverSupabaseClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client initialized with SUPABASE_SERVICE_ROLE_KEY.
 * NEVER expose this client or the service role key to the browser/frontend.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (serverSupabaseClient) {
    return serverSupabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL (hoặc VITE_SUPABASE_URL) chưa được thiết lập trong biến môi trường server.');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY chưa được thiết lập trong biến môi trường server.');
  }

  serverSupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverSupabaseClient;
}
