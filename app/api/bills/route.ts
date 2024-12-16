import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';

interface BillItem {
  name: string;
  price: number;
  quantity: number;
  category: 'Food' | 'Drinks' | 'Desserts';
}

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    // Log the raw request body for debugging
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      const parseError = error as Error;
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON data', details: parseError.message },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || typeof body.totalAmount !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request data format' },
        { status: 400 }
      );
    }

    const otp = generateOTP();

    // Create the bill
    const { error: billError } = await supabase
      .from('bills')
      .insert({
        id: otp,
        total_amount: body.totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (billError) {
      console.error('Error creating bill:', billError);
      return NextResponse.json(
        { error: 'Failed to create bill', details: billError.message },
        { status: 500 }
      );
    }

    // Create bill items
    const billItems = body.items.map((item: BillItem) => ({
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
      // Try to clean up the bill if items fail
      await supabase.from('bills').delete().eq('id', otp);
      
      return NextResponse.json(
        { error: 'Failed to create bill items', details: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      billId: otp,
      shareCode: otp
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 