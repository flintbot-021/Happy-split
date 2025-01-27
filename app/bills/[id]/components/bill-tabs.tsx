'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="split">Split Bill</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
      </TabsList>
      <TabsContent value="split">
        <BillSplitForm bill={bill} onTabChange={setActiveTab} />
      </TabsContent>
      <TabsContent value="summary">
        <DinersList bill={bill} />
      </TabsContent>
    </Tabs>
  )
} 