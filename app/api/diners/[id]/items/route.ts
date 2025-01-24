import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';

interface Item {
  itemId: string;
  quantity: number;
}

interface RequestBody {
  items: Item[];
  tipAmount: number;
  total: number;
}

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split('/');
    const dinerId = segments[segments.length - 2];
    const body = await request.json() as RequestBody;

    console.log('Processing request for diner:', dinerId);
    console.log('Request body:', body);

    // First get the diner's current items
    const { data: diner, error: fetchError } = await supabase
      .from('diners')
      .select('items')
      .eq('id', dinerId)
      .single();

    if (fetchError) {
      console.error('Error fetching diner:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch diner', details: fetchError.message },
        { status: 500 }
      );
    }

    // Merge existing items with new ones
    const existingItems = (diner?.items || []) as Item[];
    const newItems = body.items;

    // Create a map of existing items for easy lookup
    const itemsMap = new Map(existingItems.map(item => [item.itemId, item]));

    // Update or add new items
    newItems.forEach(item => {
      const existing = itemsMap.get(item.itemId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        itemsMap.set(item.itemId, item);
      }
    });

    // Convert map back to array
    const mergedItems = Array.from(itemsMap.values());

    // Update the diner with merged items and totals
    const dinerUpdate = {
      items: mergedItems,
      tip_amount: body.tipAmount,
      total: body.total
    };

    console.log('Updating diner with:', dinerUpdate);

    const { error: updateError } = await supabase
      .from('diners')
      .update(dinerUpdate)
      .eq('id', dinerId);

    if (updateError) {
      console.error('Error updating diner:', updateError);
      return NextResponse.json(
        { error: 'Failed to update diner', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('Diner updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 