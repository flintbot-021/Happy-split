import { supabase } from '@/lib/supabase/config';
import { logError } from '@/lib/utils/error-handler';
import { validateImageData } from './validators';
import type { ProcessReceiptResponse, ProcessedItem, ReceiptProcessor } from './types';

export class SupabaseReceiptProcessor implements ReceiptProcessor {
  async processReceipt(base64Image: string): Promise<ProcessedItem[]> {
    try {
      validateImageData(base64Image);

      const { data, error } = await supabase.functions.invoke<ProcessReceiptResponse>(
        'process-receipt',
        {
          body: { image: base64Image },
          headers: { 'Content-Type': 'application/json' },
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
}