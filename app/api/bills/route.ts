import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { items, totalAmount } = await request.json();
    const otp = generateOTP();

    // Create the bill with OTP as the ID
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .insert({
        id: otp,  // Using OTP as the ID for easy sharing
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (billError) {
      console.error('Error creating bill:', billError);
      throw billError;
    }

    // Create the bill items
    const billItems = items.map((item: any) => ({
      bill_id: otp,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category
    }));

    const { error: itemsError } = await supabase
      .from('bill_items')
      .insert(billItems);

    if (itemsError) {
      console.error('Error creating bill items:', itemsError);
      throw itemsError;
    }

    return NextResponse.json({ 
      billId: otp,
      shareCode: otp  // Same as billId for simplicity
    });
  } catch (error) {
    console.error('Error saving bill:', error);
    return NextResponse.json(
      { error: 'Failed to save bill' },
      { status: 500 }
    );
  }
} 