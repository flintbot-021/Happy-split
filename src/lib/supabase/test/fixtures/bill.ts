import { generateOTP } from '@/lib/utils/otp';
import type { BillInput } from '../../models/bill';

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

  // Create creator participant with matching ID
  const creator = {
    id: creatorId, // Use same ID as creator_id
    name: 'Test Creator',
    tip_percentage: 10,
    subtotal: testItem.price * testItem.quantity
  };

  return {
    otp: generateOTP(),
    status: 'active',
    creator_id: creatorId,
    total_amount: testItem.price * testItem.quantity,
    items: [testItem],
    participants: [creator] // Creator must be first participant
  };
}