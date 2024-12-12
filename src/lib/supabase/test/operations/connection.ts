import { supabase } from '../../client';
import { logTestError } from '../utils/logging';
import type { TestResult } from '../types';

export async function testConnection(): Promise<TestResult> {
  try {
    const { error } = await supabase
      .from('bills')
      .select('id')
      .limit(1);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    logTestError('Connection', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}