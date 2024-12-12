import { SupabaseReceiptProcessor } from './supabase-processor';
import { MockReceiptProcessor } from './mock-processor';

// Use mock processor for development if needed
const isDevelopment = process.env.NODE_ENV === 'development';
const processor = isDevelopment 
  ? new MockReceiptProcessor()
  : new SupabaseReceiptProcessor();

export const processReceipt = (base64Image: string) => 
  processor.processReceipt(base64Image);