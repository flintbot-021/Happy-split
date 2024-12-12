import { generateOTP } from '@/lib/utils/otp';
import type { BillInput } from '../models/bill';

export function createTestBill(): BillInput {
  // Create a consistent ID for both creator and participant
  const creatorId = crypto.randomUUID();
  
  const testItem = {
    id: crypto.randomUUID(),
    name: 'Test Item',
    quantity: 1,
    price: 100.00,
    category: 'Food' as const
  };

  // Create participant with the same ID as creator
  const creator = {
    id: creatorId,
    name: 'Test Creator',
    tip_percentage: 10,
    subtotal: testItem.price * testItem.quantity
  };

  return {
    otp: generateOTP(),
    status: 'active',
    creator_id: creatorId, // Use the same ID
    total_amount: testItem.price * testItem.quantity,
    items: [testItem],
    participants: [creator] // Creator is the first participant
  };
}