import { supabase } from '@/app/utils/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { billId, name, items, tipAmount, total } = await request.json()

    const { error } = await supabase
      .from('diners')
      .insert({
        bill_id: billId,
        name,
        items,
        tip_amount: tipAmount,
        total,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to create diner' },
      { status: 500 }
    )
  }
} 