import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

let supabase: ReturnType<typeof createClient>;

try {
  const config = getSupabaseConfig();
  supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  throw error;
}

export { supabase };