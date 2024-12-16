import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { id: dinerId, itemId } = params;

    const { error } = await supabase
      .from('diner_items')  // Adjust table name based on your schema
      .delete()
      .match({ diner_id: dinerId, item_id: itemId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
} 