import { supabase } from '../client';
import { createTestBill } from './test-data';
import { toDatabase, fromDatabase } from '../transformers/bill';
import { validateBillData } from '../validators';
import { logError } from '@/lib/utils/error-handler';
import type { Bill } from '../models/bill';

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('bills')
      .select('id')
      .limit(1);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logError('Connection Test', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

export async function testInsertBill(): Promise<{ success: boolean; error?: string; data?: Bill }> {
  try {
    // Create test bill
    const testBill = createTestBill();

    // Validate before transformation
    validateBillData(testBill);

    // Transform for database
    const dbBill = toDatabase(testBill);

    // Debug log
    console.log('Inserting bill:', JSON.stringify(dbBill, null, 2));

    // Perform insert
    const { data, error } = await supabase
      .from('bills')
      .insert(dbBill)
      .select('*')
      .single();

    if (error) {
      logError('Insert Operation', error);
      return {
        success: false,
        error: `Database error: ${error.message}`
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'No data returned from insert operation'
      };
    }

    // Transform back from database format
    const bill = fromDatabase(data);

    return { 
      success: true,
      data: bill
    };
  } catch (error) {
    logError('Test Insert', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to insert test bill'
    };
  }
}