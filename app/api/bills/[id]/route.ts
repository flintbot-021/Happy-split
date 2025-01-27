import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';
import { Bill, BillItem } from '@/app/types/bill';
import { PostgrestError } from '@supabase/supabase-js';

interface UpdateBillRequest {
  items: {
    itemId: string;
    quantity: number;
  }[];
  tip_amount: number;
  name: string;
}

interface SupabaseBill {
  id: string;
  total_amount: number;
  created_at: string;
}

interface SupabaseDiner {
  id: string;
  bill_id: string;
  name: string;
  total: number;
  tip_amount: number;
  created_at: string;
}

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single() as { data: SupabaseBill | null; error: PostgrestError | null };

    if (billError) throw billError;

    const { data: billItems, error: itemsError } = await supabase
      .from('bill_items')
      .select('*')
      .eq('bill_id', id) as { data: BillItem[] | null; error: PostgrestError | null };

    if (itemsError) throw itemsError;

    const { data: diners, error: dinersError } = await supabase
      .from('diners')
      .select('*')
      .eq('bill_id', id) as { data: SupabaseDiner[] | null; error: PostgrestError | null };

    if (dinersError) throw dinersError;

    const response: Bill = {
      ...bill!,
      bill_items: billItems || [],
      diners: (diners || []).map(diner => ({
        ...diner,
        items: []
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const body = await request.json() as UpdateBillRequest;

    // Create new diner
    const { data: diner, error: dinerError } = await supabase
      .from('diners')
      .insert({
        bill_id: id,
        name: body.name,
        tip_amount: body.tip_amount,
      })
      .select()
      .single() as { data: SupabaseDiner | null; error: PostgrestError | null };

    if (dinerError) throw dinerError;

    // Create diner items
    const dinerItems = body.items.map(item => ({
      diner_id: diner!.id,
      item_id: item.itemId,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('diner_items')
      .insert(dinerItems) as { error: PostgrestError | null };

    if (itemsError) throw itemsError;

    return NextResponse.json(diner);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const body = await request.json() as { total: number };

    const { error: dinerError } = await supabase
      .from('diners')
      .update({ total: body.total })
      .eq('id', id) as { error: PostgrestError | null };

    if (dinerError) throw dinerError;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
} 