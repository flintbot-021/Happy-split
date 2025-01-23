import { NextResponse } from 'next/server';
import { supabase } from '@/lib/utils';

export async function DELETE(
  request: Request
) {
  try {
    const segments = request.url.split('/');
    const itemId = segments.pop();
    const id = segments[segments.length - 2];

    const { error } = await supabase
      .from('diner_items')
      .delete()
      .match({ diner_id: id, item_id: itemId });

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