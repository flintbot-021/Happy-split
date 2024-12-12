import { useState, useEffect } from 'react';
import { supabase, subscribeToBillUpdates } from '@/lib/supabase';
import type { Bill } from '@/types/bill';

export const useBill = (billId: string) => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .eq('id', billId)
          .single();

        if (error) throw error;
        setBill(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();

    const unsubscribe = subscribeToBillUpdates(billId, (payload) => {
      setBill(payload.new as Bill);
    });

    return () => {
      unsubscribe();
    };
  }, [billId]);

  return { bill, loading, error };
};