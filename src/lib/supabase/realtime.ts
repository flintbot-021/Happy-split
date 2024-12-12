import { supabase } from './client';
import type { Bill } from '@/types/database';
import type { RealtimeSubscription } from './types';

export type RealtimeCallback = (payload: { new: Bill }) => void;

/**
 * Subscribe to real-time updates for a specific bill
 * @param billId - The ID of the bill to subscribe to
 * @param callback - Function to call when updates are received
 * @returns Unsubscribe function
 */
export function subscribeToBill(billId: string, callback: RealtimeCallback): RealtimeSubscription {
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

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}