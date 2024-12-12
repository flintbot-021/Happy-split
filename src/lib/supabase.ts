import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const subscribeToBillUpdates = (
  billId: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel(`bill:${billId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'bills',
      filter: `id=eq.${billId}`
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};