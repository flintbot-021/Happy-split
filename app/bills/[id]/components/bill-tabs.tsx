'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BillSplitForm } from "./bill-split-form"
import { DinersList } from "./diners-list"
import { CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const handleEditBill = () => {
    router.push(`/create?billId=${bill.id}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        {/* Fixed Header */}
        <div className={cn(
          "fixed top-0 left-0 right-0 bg-background z-10 border-b",
          "supports-[padding-top:env(safe-area-inset-top)]:pt-[env(safe-area-inset-top)]"
        )}>
          <div className="max-w-md mx-auto px-4">
            <div className="flex flex-row items-center justify-between py-4">
              <CardTitle>
                {activeTab === 'split' ? 'Select Your Items' : 'Bill Summary'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleEditBill}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit Bill
              </Button>
            </div>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="split">Split Bill</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
          </div>
        </div>

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