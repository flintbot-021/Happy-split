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

      {/* Bill Code Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="py-3 px-4 flex justify-between items-center max-w-3xl mx-auto">
          <div className="text-sm text-muted-foreground">Bill Code</div>
          <div className="font-mono font-medium">{id}</div>
        </div>
      </div>
    </div>
  )
} 