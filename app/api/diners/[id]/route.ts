import { NextResponse } from 'next/server'
import { supabase } from '@/app/utils/supabase'

export async function DELETE(
  request: Request,
) {
  try {
    const id = request.url.split('/').pop()

    const { error } = await supabase
      .from('diners')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete diner' },
      { status: 500 }
    )
  }
} 