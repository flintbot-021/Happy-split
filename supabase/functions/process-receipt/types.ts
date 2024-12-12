export interface ProcessedItem {
  name: string;
  quantity: number;
  price: number;
  category: 'Drinks' | 'Food' | 'Desserts';
}

export interface RequestBody {
  image: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}