export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: 'Drinks' | 'Food' | 'Desserts';
  assignedTo?: string;
}

export interface Bill {
  id: string;
  createdAt: string;
  items: BillItem[];
  creatorId: string;
  otp: string;
  status: 'active' | 'expired';
  totalAmount: number;
  participants: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  tipPercentage: number;
  subtotal: number;
}