export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: 'Drinks' | 'Food' | 'Desserts';
  assigned_to?: string;
}