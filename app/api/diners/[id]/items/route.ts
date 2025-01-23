import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { items, tipAmount, total } = await request.json();

    // First, get the existing diner's items
    const { data: existingDiner } = await supabase
      .from('diners')
      .select('items')
      .eq('id', params.id)
      .single();

    if (!existingDiner) {
      return NextResponse.json(
        { error: 'Diner not found' },
        { status: 404 }
      );
    }

    // Merge existing items with new items
    const mergedItems = [...(existingDiner.items || [])];
    
    // Update or add new items
    items.forEach((newItem: { itemId: string; quantity: number }) => {
      const existingIndex = mergedItems.findIndex(item => item.itemId === newItem.itemId);
      if (existingIndex >= 0) {
        // Update existing item quantity
        mergedItems[existingIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        mergedItems.push(newItem);
      }
    });

    // Update the diner with merged items and new totals
    const { error } = await supabase
      .from('diners')
      .update({
        items: mergedItems,
        tip_amount: tipAmount,
        total: total,
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating diner items:', error);
    return NextResponse.json(
      { error: 'Failed to update diner items' },
      { status: 500 }
    );
  }
} 