import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillSplitForm } from "./components/bill-split-form"
import { DinersList } from "./components/diners-list"
import { supabase } from '@/app/utils/supabase'
import { analytics } from '@/lib/posthog'
import { notFound } from 'next/navigation'

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

export default async function BillPage({ params }: PageProps) {
  const { id } = await params
  const bill = await getBillWithDiners(id)
  if (!bill) notFound()

  // Calculate total paid and outstanding amount
  const totalPaid = bill.diners.reduce((sum: number, diner: { total: number }) => sum + diner.total, 0)
  const outstandingAmount = bill.total_amount - totalPaid

  // Track summary viewing
  analytics.summaryViewed({
    billId: bill.id,
    outstandingAmount,
    participantCount: bill.diners.length,
    isComplete: outstandingAmount === 0
  })

  return (
    <div className="relative min-h-screen pb-16">
      <div className="py-4">
        <Tabs defaultValue="split" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="split">Split Bill</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="split">
            <BillSplitForm bill={bill} />
          </TabsContent>
          <TabsContent value="summary">
            <DinersList bill={bill} />
          </TabsContent>
        </Tabs>
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