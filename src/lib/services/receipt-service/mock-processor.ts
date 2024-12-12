import type { ProcessedItem } from './types';

export class MockReceiptProcessor {
  async processReceipt(base64Image: string): Promise<ProcessedItem[]> {
    // For development/testing when Edge Function is not available
    return [
      {
        name: "Test Item",
        quantity: 1,
        price: 100,
        category: "Food"
      }
    ];
  }
}