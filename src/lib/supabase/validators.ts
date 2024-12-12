import type { BillInput } from './models/bill';

export function validateBillData(bill: BillInput): void {
  if (!bill) {
    throw new Error('Bill data is required');
  }

  // Validate OTP
  if (!bill.otp?.match(/^[A-Z0-9]{4}$/)) {
    throw new Error('OTP must be 4 uppercase letters or numbers');
  }

  // Validate status
  if (!['active', 'expired'].includes(bill.status)) {
    throw new Error('Status must be either "active" or "expired"');
  }

  // Validate creator_id
  if (!bill.creator_id?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid creator_id UUID format');
  }

  // Validate total_amount
  if (typeof bill.total_amount !== 'number' || bill.total_amount <= 0) {
    throw new Error('Total amount must be a positive number');
  }

  // Validate items array
  if (!Array.isArray(bill.items) || bill.items.length === 0) {
    throw new Error('Bill must have at least one item');
  }

  // Validate each item
  bill.items.forEach((item, index) => {
    if (!item.id?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      throw new Error(`Invalid item ID at index ${index}`);
    }
    if (!item.name || typeof item.name !== 'string') {
      throw new Error(`Invalid item name at index ${index}`);
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity at index ${index}`);
    }
    if (typeof item.price !== 'number' || item.price <= 0) {
      throw new Error(`Invalid price at index ${index}`);
    }
    if (!['Drinks', 'Food', 'Desserts'].includes(item.category)) {
      throw new Error(`Invalid category at index ${index}`);
    }
  });

  // Validate participants array
  if (!Array.isArray(bill.participants) || bill.participants.length === 0) {
    throw new Error('Bill must have at least one participant');
  }

  // Validate each participant
  bill.participants.forEach((participant, index) => {
    if (!participant.id?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      throw new Error(`Invalid participant ID at index ${index}`);
    }
    if (!participant.name || typeof participant.name !== 'string') {
      throw new Error(`Invalid participant name at index ${index}`);
    }
    if (typeof participant.tip_percentage !== 'number' || participant.tip_percentage < 0) {
      throw new Error(`Invalid tip percentage at index ${index}`);
    }
    if (typeof participant.subtotal !== 'number' || participant.subtotal < 0) {
      throw new Error(`Invalid subtotal at index ${index}`);
    }
  });

  // Verify creator is a participant
  if (!bill.participants.some(p => p.id === bill.creator_id)) {
    throw new Error('Creator must be a participant');
  }
}