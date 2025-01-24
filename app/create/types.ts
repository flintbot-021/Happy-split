export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';
export type Category = 'Food' | 'Drinks' | 'Desserts';

export interface ExtractedItem {
  name: string;
  price: number;
  quantity: number;
  category?: Category;
} 