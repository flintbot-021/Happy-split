export type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';
export type Category = 'Drinks' | 'Food' | 'Desserts';

export const CATEGORY_ORDER: Category[] = ['Drinks', 'Food', 'Desserts'];

export interface ExtractedItem {
  name: string;
  price: number;
  quantity: number;
  category?: Category;
} 