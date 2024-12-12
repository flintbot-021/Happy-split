import { supabase } from './client';
import { toDatabase, fromDatabase } from './transformers/bill';
import { validateBillData } from './validators';
import type { Bill, BillInput } from './models/bill';

export async function createBill(input: BillInput): Promise<Bill> {
  try {
    validateBillData(input);
    const dbBill = toDatabase(input);

    const { data, error } = await supabase
      .from('bills')
      .insert(dbBill)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert operation');

    return fromDatabase(data);
  } catch (error) {
    console.error('Create Bill Error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to create bill');
  }
}

export async function getBill(id: string): Promise<Bill> {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Bill not found');

    return fromDatabase(data);
  } catch (error) {
    console.error('Get Bill Error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to fetch bill');
  }
}

export async function updateBill(id: string, updates: Partial<BillInput>): Promise<Bill> {
  try {
    const { data: current } = await supabase
      .from('bills')
      .select()
      .eq('id', id)
      .single();

    if (!current) throw new Error('Bill not found');

    const merged = {
      ...fromDatabase(current),
      ...updates
    };

    validateBillData(merged);
    const dbBill = toDatabase(merged);

    const { data, error } = await supabase
      .from('bills')
      .update(dbBill)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update operation');

    return fromDatabase(data);
  } catch (error) {
    console.error('Update Bill Error:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to update bill');
  }
}