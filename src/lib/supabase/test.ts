import { supabase } from './client';
import { validateBillData } from './validators';
import { generateOTP } from '@/lib/utils/otp';
import type { Bill } from '@/types/database';

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('id')
      .limit(1);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

export async function testInsertBill(): Promise<{ success: boolean; error?: string; data?: Bill }> {
  try {
    const testBill = {
      otp: generateOTP(),
      status: 'active' as const,
      creator_id: crypto.randomUUID(),
      total_amount: 100.00,
      items: [
        {
          id: crypto.randomUUID(),
          name: 'Test Item',
          quantity: 1,
          price: 100.00,
          category: 'Food' as const
        }
      ],
      participants: [
        {
          id: crypto.randomUUID(),
          name: 'Test User',
          tip_percentage: 10,
          subtotal: 100.00
        }
      ]
    };

    // Validate bill data before insertion
    validateBillData(testBill);

    const { data, error } = await supabase
      .from('bills')
      .insert(testBill)
      .select()
      .single();

    if (error) {
      console.error('Insert Error:', error);
      throw error;
    }

    return { 
      success: true, 
      data: data as Bill 
    };
  } catch (error) {
    console.error('Test Insert Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to insert test bill' 
    };
  }
}