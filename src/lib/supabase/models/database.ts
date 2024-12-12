// These types match the exact structure expected by Supabase
export interface DatabaseBill {
  id?: string;
  created_at?: string;
  otp: string;
  status: 'active' | 'expired';
  creator_id: string;
  total_amount: number;
  // JSONB columns are handled automatically by Supabase
  items: any[];
  participants: any[];
}