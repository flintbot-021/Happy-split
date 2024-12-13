'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from '@supabase/supabase-js'
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

// Create a Supabase client for the browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DinerItem {
  itemId: string
  quantity: number
}

interface Diner {
  id: string
  name: string
  items: DinerItem[]
  tip_amount: number
  total: number
}

interface Bill {
  id: string
  total_amount: number
  bill_items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  diners: Diner[]
}

export function DinersList({ bill }: { bill: Bill }) {
  const router = useRouter()
  const [dinerToDelete, setDinerToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Create a channel for both diners and bills
    const channel = supabase
      .channel('bill_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diners',
          filter: `bill_id=eq.${bill.id}`
        },
        () => {
          // Refresh data when diners change
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `id=eq.${bill.id}`
        },
        () => {
          // Refresh data when bill changes
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bill.id, router])

  const getItemName = (itemId: string) => {
    return bill.bill_items.find(item => item.id === itemId)?.name || 'Unknown Item'
  }

  const getItemPrice = (itemId: string) => {
    return bill.bill_items.find(item => item.id === itemId)?.price || 0
  }

  // Calculate totals
  const totalPaid = bill.diners.reduce((sum, diner) => sum + diner.total, 0)
  const billTotal = bill.total_amount
  const outstandingAmount = billTotal - totalPaid

  // Calculate tip and items totals
  const tipTotal = bill.diners.reduce((sum, diner) => sum + diner.tip_amount, 0)
  const itemsTotal = totalPaid - tipTotal

  // Calculate tip percentage
  const tipPercentage = ((tipTotal / itemsTotal) * 100).toFixed(1)

  const handleDelete = async (dinerId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/diners/${dinerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      router.refresh()
    } catch (error) {
      console.error('Error deleting diner:', error)
      // Could add toast notification here
    } finally {
      setIsDeleting(false)
      setDinerToDelete(null)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bill Summary</CardTitle>
          <span className="text-sm text-muted-foreground">
            {bill.diners.length} diners
          </span>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {bill.diners.map((diner) => (
                <div key={diner.id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{diner.name}</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setDinerToDelete(diner.id)}
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-bold">
                        R{diner.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {diner.items.map((item) => (
                      <div key={item.itemId} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {getItemName(item.itemId)}
                          {item.quantity > 1 && ` (${item.quantity}x)`}
                        </span>
                        <span>
                          R{(getItemPrice(item.itemId) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {diner.tip_amount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Tip</span>
                        <span>R{diner.tip_amount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-6 space-y-4">
            <Collapsible>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Paid</span>
                  <CollapsibleTrigger className="hover:text-muted-foreground transition-colors">
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                </div>
                <span className="text-xl font-bold">
                  R{totalPaid.toFixed(2)}
                </span>
              </div>
              
              <CollapsibleContent className="pt-2 space-y-1">
                <div className="flex justify-between items-center text-sm pl-4">
                  <span className="text-muted-foreground">Items</span>
                  <span>R{itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pl-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Tips</span>
                    <Badge variant="secondary" className="text-xs">
                      {tipPercentage}%
                    </Badge>
                  </div>
                  <span className="text-green-600">R{tipTotal.toFixed(2)}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <div className="font-medium">Total Bill</div>
              </div>
              <div className="text-medium">
                R{bill.total_amount.toFixed(2)}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center font-medium">
              <span>Outstanding Amount</span>
              <span className="text-red-600">
                R{outstandingAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!dinerToDelete} onOpenChange={() => setDinerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your selections from the bill. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDinerToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => dinerToDelete && handleDelete(dinerToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 