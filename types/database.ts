export interface Bill {
    id: string;
    created_at: string;
    expires_at: string;
    otp: string;
    status: 'active' | 'expired';
    total_amount: number;
    active_users: number;
    creator_name: string;
}

export interface BillItem {
    id: string;
    bill_id: string;
    name: string;
    quantity: number;
    price: number;
    category: 'Drinks' | 'Food' | 'Desserts';
    created_at: string;
}

export interface Participant {
    id: string;
    bill_id: string;
    name: string;
    tip_percentage: number;
    created_at: string;
}

export interface ItemAssignment {
    id: string;
    bill_item_id: string;
    participant_id: string;
    quantity: number;
    created_at: string;
} 