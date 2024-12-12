import { supabase } from './supabase';
import { generateOTP } from './utils';
import type { Bill, BillItem, Participant } from '@/types/bill';

export async function createBill(items: BillItem[], creatorName: string): Promise<Bill> {
  const creatorId = crypto.randomUUID();
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const creator: Participant = {
    id: creatorId,
    name: creatorName,
    tipPercentage: 10,
    subtotal: 0,
  };

  const bill: Omit<Bill, 'id' | 'createdAt'> = {
    items,
    creatorId,
    otp: generateOTP(),
    status: 'active',
    totalAmount,
    participants: [creator],
  };

  const { data, error } = await supabase
    .from('bills')
    .insert(bill)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create bill');
  }

  return data;
}

export async function joinBill(otp: string, name: string): Promise<Bill> {
  const { data: bill, error: findError } = await supabase
    .from('bills')
    .select()
    .eq('otp', otp)
    .eq('status', 'active')
    .single();

  if (findError || !bill) {
    throw new Error('Bill not found');
  }

  const participant: Participant = {
    id: crypto.randomUUID(),
    name,
    tipPercentage: 10,
    subtotal: 0,
  };

  const { data: updatedBill, error: updateError } = await supabase
    .from('bills')
    .update({
      participants: [...bill.participants, participant],
    })
    .eq('id', bill.id)
    .select()
    .single();

  if (updateError) {
    throw new Error('Failed to join bill');
  }

  return updatedBill;
}

export async function getBill(id: string): Promise<Bill> {
  const { data, error } = await supabase
    .from('bills')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    throw new Error('Bill not found');
  }

  return data;
}

export async function updateBillItem(
  billId: string,
  itemId: string,
  participantId: string,
  updatedItem: Partial<BillItem>
): Promise<void> {
  const { data: bill, error: findError } = await supabase
    .from('bills')
    .select()
    .eq('id', billId)
    .single();

  if (findError) {
    throw new Error('Bill not found');
  }

  const updatedItems = bill.items.map(item =>
    item.id === itemId ? { ...item, ...updatedItem, assignedTo: participantId } : item
  );

  const { error: updateError } = await supabase
    .from('bills')
    .update({ items: updatedItems })
    .eq('id', billId);

  if (updateError) {
    throw new Error('Failed to update item');
  }
}

export async function updateParticipantTip(
  billId: string,
  participantId: string,
  tipPercentage: number
): Promise<void> {
  const { data: bill, error: findError } = await supabase
    .from('bills')
    .select()
    .eq('id', billId)
    .single();

  if (findError) {
    throw new Error('Bill not found');
  }

  const updatedParticipants = bill.participants.map(p =>
    p.id === participantId ? { ...p, tipPercentage } : p
  );

  const { error: updateError } = await supabase
    .from('bills')
    .update({ participants: updatedParticipants })
    .eq('id', billId);

  if (updateError) {
    throw new Error('Failed to update tip');
  }
}