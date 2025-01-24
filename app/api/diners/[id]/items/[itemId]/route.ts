import { NextResponse } from 'next/server'
import { supabase } from '@/lib/utils'

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const id = segments[segments.length - 3]
    const itemId = segments[segments.length - 1]

    const { error } = await supabase
      .from('diner_items')
      .delete()
      .match({ diner_id: id, item_id: itemId })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
} 