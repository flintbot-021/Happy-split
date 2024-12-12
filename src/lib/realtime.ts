import { supabase } from './supabase';
import type { Bill } from '@/types/bill';

export type RealtimeCallback = (payload: { new: Bill }) => void;

export function subscribeToRealtimeUpdates(billId: string, callback: RealtimeCallback) {
  const channel = supabase
    .channel(`bill:${billId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bills',
        filter: `id=eq.${billId}`,
      },
      (payload) => callback(payload as any)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}