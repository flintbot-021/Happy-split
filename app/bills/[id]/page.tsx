import { BillTabs } from "./components/bill-tabs"
import { supabase } from '@/lib/utils'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BillPage({ params }: PageProps) {
  const { id } = await params

  const { data: bill } = await supabase
    .from('bills')
    .select(`
      *,
      bill_items (*),
      diners (*)
    `)
    .eq('id', id)
    .single()

  if (!bill) return notFound()

  return (
    <div className="relative min-h-screen pb-16">
      <div className="py-4">
        <BillTabs bill={bill} />
      </div>

      
    </div>
  )
} 