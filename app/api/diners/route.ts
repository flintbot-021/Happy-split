import { supabase } from '@/app/utils/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('diners')
      .insert([{
        bill_id: body.billId,
        name: body.name,
        items: body.items,
        tip_amount: body.tipAmount,
        total: body.total,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to save diner' },
      { status: 500 }
    )
  }
} 