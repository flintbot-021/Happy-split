export interface ProcessedItem {
  name: string;
  quantity: number;
  price: number;
  category: 'Drinks' | 'Food' | 'Desserts';
}

export interface ProcessReceiptResponse {
  items: ProcessedItem[];
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface ReceiptProcessor {
  processReceipt(base64Image: string): Promise<ProcessedItem[]>;
}