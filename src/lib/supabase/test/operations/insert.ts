import { supabase } from '../../client';
import { createTestBill } from '../fixtures/bill';
import { validateTestBill } from '../utils/validation';
import { logTestOperation, logTestError } from '../utils/logging';
import { toDatabase } from '../../transformers/bill';
import type { TestResult } from '../types';
import type { Bill } from '../../models/bill';

export async function testInsert(): Promise<TestResult<Bill>> {
  try {
    // Create and validate test bill
    const testBill = createTestBill();
    validateTestBill(testBill);

    // Transform for database
    const dbBill = toDatabase(testBill);
    logTestOperation('Insert Data', dbBill);

    // Perform insert
    const { data, error } = await supabase
      .from('bills')
      .insert(dbBill)
      .select()
      .single();

    if (error) {
      logTestError('Insert', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    // Return the raw data since it's already in the correct format
    return { success: true, data: data as Bill };
  } catch (error) {
    logTestError('Insert', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to insert test bill'
    };
  }
}