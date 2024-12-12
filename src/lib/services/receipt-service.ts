import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/utils/error-handler';
import type { BillItem } from '@/types/database';

interface ProcessReceiptResponse {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    category: 'Drinks' | 'Food' | 'Desserts';
  }>;
  error?: {
    message: string;
    details?: unknown;
  };
}

export async function processReceipt(base64Image: string): Promise<BillItem[]> {
  if (!base64Image) {
    throw new Error('No image data provided');
  }

  try {
    const { data, error } = await supabase.functions.invoke<ProcessReceiptResponse>(
      'process-receipt',
      {
        body: { image: base64Image },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (error) {
      logError('Receipt Processing', error);
      throw new Error(error.message || 'Failed to process receipt');
    }

    if (!data) {
      throw new Error('No response data received');
    }

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!Array.isArray(data.items)) {
      throw new Error('Invalid response format: items array not found');
    }

    return data.items.map(item => ({
      id: crypto.randomUUID(),
      name: item.name || 'Unknown Item',
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: Math.max(0, Number(item.price) || 0),
      category: item.category || 'Food',
    }));
  } catch (error) {
    logError('Receipt Processing', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to process receipt. Please try again or enter items manually.');
  }
}