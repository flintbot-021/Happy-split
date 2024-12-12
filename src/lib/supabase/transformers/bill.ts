import type { Bill, BillInput } from '../models/bill';
import type { DatabaseBill } from '../models/database';

export function toDatabase(bill: BillInput): DatabaseBill {
  // Validate arrays before transformation
  const items = Array.isArray(bill.items) ? bill.items : [];
  const participants = Array.isArray(bill.participants) ? bill.participants : [];

  return {
    otp: bill.otp,
    status: bill.status,
    creator_id: bill.creator_id,
    total_amount: bill.total_amount,
    // Convert arrays to JSONB format by passing the arrays directly
    // Supabase will handle the JSONB conversion
    items,
    participants
  };
}

export function fromDatabase(dbBill: DatabaseBill): Bill {
  return {
    id: dbBill.id,
    created_at: dbBill.created_at,
    otp: dbBill.otp,
    status: dbBill.status,
    creator_id: dbBill.creator_id,
    total_amount: dbBill.total_amount,
    // Arrays are already parsed by Supabase
    items: Array.isArray(dbBill.items) ? dbBill.items : [],
    participants: Array.isArray(dbBill.participants) ? dbBill.participants : []
  };
}