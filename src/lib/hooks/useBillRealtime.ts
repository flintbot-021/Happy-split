import { useState, useEffect } from 'react';
import { getBill } from '@/lib/supabase/bills';
import { subscribeToBill } from '@/lib/supabase/realtime';
import type { Bill } from '@/types/database';

export function useBillRealtime(billId: string) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const data = await getBill(billId);
        setBill(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch bill'));
      } finally {
        setLoading(false);
      }
    };

    fetchBill();

    const unsubscribe = subscribeToBill(billId, (payload) => {
      setBill(payload.new);
    });

    return () => {
      unsubscribe();
    };
  }, [billId]);

  return { bill, loading, error };
}