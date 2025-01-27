import { NextResponse } from 'next/server'
import { supabase } from '@/lib/utils'

interface BillItem {
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export async function PUT(request: Request) {
  try {
    const id = request.url.split('/bills/')[1].split('/')[0];
    const { items, totalAmount } = await request.json()

    console.log('Updating bill:', { id, totalAmount, itemCount: items.length });

    // First, get the current bill with items and diners
    const { data: currentBill, error: billError } = await supabase
      .from('bills')
      .select(`
        id,
        bill_items (
          id,
          name
        ),
        diners (
          id,
          items
        )
      `)
      .eq('id', id)
      .single();

    if (billError || !currentBill) {
      console.error('Bill not found:', billError);
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Create a map of item names to their diner assignments
    const itemAssignments = new Map();
    if (currentBill.diners) {
      currentBill.diners.forEach((diner: any) => {
        if (diner.items) {
          diner.items.forEach((item: any) => {
            const billItem = currentBill.bill_items.find((bi: any) => bi.id === item.itemId);
            if (billItem) {
              const assignments = itemAssignments.get(billItem.name.toLowerCase()) || [];
              assignments.push({ dinerId: diner.id, quantity: item.quantity });
              itemAssignments.set(billItem.name.toLowerCase(), assignments);
            }
          });
        }
      });
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('bill_items')
      .delete()
      .eq('bill_id', id);

    if (deleteError) {
      console.error('Failed to delete items:', deleteError);
      return NextResponse.json({ error: 'Failed to delete existing items' }, { status: 500 });
    }

    // Insert new items
    const { data: newItems, error: insertError } = await supabase
      .from('bill_items')
      .insert(
        items.map((item: BillItem) => ({
          bill_id: id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category || 'Food',
          created_at: new Date().toISOString()
        }))
      )
      .select();

    if (insertError || !newItems) {
      console.error('Failed to insert items:', insertError);
      return NextResponse.json({ error: 'Failed to insert new items' }, { status: 500 });
    }

    // Restore diner assignments
    for (const newItem of newItems) {
      const assignments = itemAssignments.get(newItem.name.toLowerCase());
      if (assignments) {
        for (const assignment of assignments) {
          const { data: diner } = await supabase
            .from('diners')
            .select('items')
            .eq('id', assignment.dinerId)
            .single();

          if (diner) {
            const updatedItems = diner.items.map((item: any) => {
              const oldItem = currentBill.bill_items.find((bi: any) => bi.id === item.itemId);
              if (oldItem && oldItem.name.toLowerCase() === newItem.name.toLowerCase()) {
                return { ...item, itemId: newItem.id };
              }
              return item;
            });

            const { error: updateError } = await supabase
              .from('diners')
              .update({ items: updatedItems })
              .eq('id', assignment.dinerId);

            if (updateError) {
              console.error('Failed to update diner assignments:', updateError);
            }
          }
        }
      }
    }

    // Update bill total amount
    const { error: updateError } = await supabase
      .from('bills')
      .update({ 
        total_amount: totalAmount,
        status: 'pending'
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update bill:', updateError);
      return NextResponse.json({ error: 'Failed to update bill total' }, { status: 500 });
    }

    console.log('Bill updated successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 