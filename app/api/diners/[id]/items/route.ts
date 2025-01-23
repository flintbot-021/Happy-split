import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { items, tipAmount, total } = await request.json();

    // Update diner's items
    const { error: itemsError } = await supabase
      .from('diner_items')
      .delete()
      .eq('diner_id', id);

    if (itemsError) throw itemsError;

    if (items.length > 0) {
      const { error: insertError } = await supabase
        .from('diner_items')
        .insert(
          items.map((item: { itemId: string; quantity: number }) => ({
            diner_id: id,
            item_id: item.itemId,
            quantity: item.quantity,
          }))
        );

      if (insertError) throw insertError;
    }

    // Update diner's tip and total
    const { error: dinerError } = await supabase
      .from('diners')
      .update({
        tip_amount: tipAmount,
        total: total,
      })
      .eq('id', id);

    if (dinerError) throw dinerError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating diner items:', error);
    return NextResponse.json(
      { error: 'Failed to update diner items' },
      { status: 500 }
    );
  }
} 