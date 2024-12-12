import { validateBillData } from '../../validators';
import { logTestError } from '@/lib/utils/error-handler';
import type { BillInput } from '../../models/bill';

export function validateTestBill(bill: BillInput): void {
  try {
    // Additional test-specific validation
    if (!bill.participants.some(p => p.id === bill.creator_id)) {
      throw new Error('Test bill must have creator as a participant');
    }

    // Run standard validation
    validateBillData(bill);
  } catch (error) {
    logTestError('Test Bill Validation', error);
    throw error;
  }
}