import { supabase } from '@/app/utils/supabase'
import { notFound } from 'next/navigation'
import { BillSplitForm } from './components/bill-split-form'

async function getBill(billId: string) {
  const { data: bill } = await supabase
    .from('bills')
    .select(`
      *,
      bill_items (
        *
      )
    `)
    .eq('id', billId)
    .single()

  if (!bill) {
    notFound()
  }

  return bill
}

export default async function BillPage({
  params,
}: {
  params: { id: string }
}) {
  const bill = await getBill(params.id)

  return <BillSplitForm bill={bill} />
} 