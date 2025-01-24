import { NextResponse } from 'next/server'
import { supabase } from '@/lib/utils'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { items, totalAmount } = await request.json()

    // First, delete existing items
    const { error: deleteError } = await supabase
      .from('bill_items')
      .delete()
      .eq('bill_id', id)

    if (deleteError) {
      throw new Error('Failed to delete existing items')
    }

    // Then insert new items
    const { error: insertError } = await supabase
      .from('bill_items')
      .insert(
        items.map((item: any) => ({
          bill_id: id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category
        }))
      )

    if (insertError) {
      throw new Error('Failed to insert new items')
    }

    // Update bill total amount
    const { error: updateError } = await supabase
      .from('bills')
      .update({ total_amount: totalAmount })
      .eq('id', id)

    if (updateError) {
      throw new Error('Failed to update bill total')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update bill' },
      { status: 500 }
    )
  }
} 