export interface BillItem {
  id: string;
  bill_id: string;
  name: string;
  price: number;
  quantity: number;
  category: 'Food' | 'Drinks' | 'Desserts';
  unit?: string;
}

export interface DinerItem {
  diner_id: string;
  item_id: string;
  quantity: number;
}

export interface Diner {
  id: string;
  bill_id: string;
  name: string;
  total: number;
  tip_amount: number;
  items: DinerItem[];
}

export interface Bill {
  id: string;
  total_amount: number;
  bill_items: BillItem[];
  diners: Diner[];
} 