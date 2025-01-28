'use client'

import { useState } from 'react'
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { BillSplitForm } from "./bill-split-form"
import { DinersList } from "./diners-list"

interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  category: 'Food' | 'Drinks' | 'Desserts'
}

interface DinerItem {
  itemId: string
  quantity: number
}

interface Diner {
  id: string
  name: string
  items: DinerItem[]
  total: number
  tip_amount: number
}

interface Bill {
  id: string
  total_amount: number
  bill_items: BillItem[]
  diners: Diner[]
}

interface BillTabsProps {
  bill: Bill
}

export function BillTabs({ bill }: BillTabsProps) {
  const [activeTab, setActiveTab] = useState('split')

  return (
    <div className="h-screen flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsContent value="split" className="flex-1 data-[state=active]:flex data-[state=active]:flex-col">
          <BillSplitForm bill={bill} onTabChange={setActiveTab} />
        </TabsContent>
        <TabsContent value="summary" className="flex-1 data-[state=active]:flex data-[state=active]:flex-col">
          <DinersList bill={bill} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 