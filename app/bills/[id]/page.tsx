import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillSplitForm } from "./components/bill-split-form"
import { DinersList } from "./components/diners-list"
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

export default async function BillPage({
  params,
}: {
  params: { id: string }
}) {
  const bill = await getBillWithDiners(params.id)

  return (
    <div className="container mx-auto py-4">
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
  )
} 