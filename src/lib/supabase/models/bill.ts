export interface Bill {
  id?: string;
  created_at?: string;
  otp: string;
  status: 'active' | 'expired';
  creator_id: string;
  total_amount: number;
  items: BillItem[];
  participants: Participant[];
}

export interface BillInput extends Omit<Bill, 'id' | 'created_at'> {}

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: 'Drinks' | 'Food' | 'Desserts';
  assigned_to?: string;
}

export interface Participant {
  id: string;
  name: string;
  tip_percentage: number;
  subtotal: number;
}