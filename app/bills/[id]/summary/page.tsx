import { supabase } from '@/app/utils/supabase'
import { DinersList } from '../components/diners-list'

async function getBillWithDiners(billId: string) {
  const { data: bill } = await supabase
    .from('bills')
    .select(`
      *,
      diners (*)
    `)
    .eq('id', billId)
    .single()

  return bill
}

export default async function BillSummaryPage({
  params,
}: {
  params: { id: string }
}) {
  const bill = await getBillWithDiners(params.id)

  return (
    <div className="p-4">
      <DinersList bill={bill} />
    </div>
  )
} 