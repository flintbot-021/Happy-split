import { DinersList } from "../components/diners-list"
import { supabase } from '@/app/utils/supabase'

async function getBillWithDiners(billId: string) {
  const { data: bill } = await supabase
    .from('bills')
    .select(`
      *,
      bill_items (*),
      diners (*)
    `)
    .eq('id', billId)
    .single()

  return bill
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SummaryPage({ params }: PageProps) {
  const { id } = await params
  const bill = await getBillWithDiners(id)

  return (
    <div className="container mx-auto py-4">
      <DinersList bill={bill} />
    </div>
  )
} 