'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/utils'
import { Edit2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
  const [editingDiner, setEditingDiner] = useState<string | null>(null)
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

  // Calculate totals
  const totalPaid = bill.diners.reduce((sum, diner) => sum + diner.total, 0)
  const billTotal = bill.total_amount
  const outstandingAmount = billTotal - totalPaid

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

  const handleDeleteItem = async (dinerId: string, itemId: string) => {
    try {
      // First get the current diner to access their items
      const { data: diner, error: fetchError } = await supabase
        .from('diners')
        .select('items, tip_amount')
        .eq('id', dinerId)
        .single();

      if (fetchError) throw fetchError;

      // Filter out the item to be deleted
      const updatedItems = diner.items.filter((item: DinerItem) => item.itemId !== itemId);

      // Calculate new total for the diner
      const newItemsTotal = updatedItems.reduce((sum: number, item: DinerItem) => {
        const billItem = bill.bill_items.find(bi => bi.id === item.itemId);
        return sum + (billItem ? billItem.price * item.quantity : 0);
      }, 0);

      // Add tip amount to get final total
      const newTotal = newItemsTotal + diner.tip_amount;

      // Update the diner with the new items array and total
      const { error: updateError } = await supabase
        .from('diners')
        .update({ 
          items: updatedItems,
          total: newTotal
        })
        .eq('id', dinerId);

      if (updateError) throw updateError;
      
      router.refresh();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable Content */}
      <div className={cn(
        "flex-1 overflow-y-auto pb-40 px-4",
        "pt-32",
        "supports-[padding-top:env(safe-area-inset-top)]:pt-[calc(128px+env(safe-area-inset-top))]"
      )}>
        <div className="max-w-md mx-auto space-y-8">
          {bill.diners.map((diner) => (
            <div key={diner.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{diner.name}</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setEditingDiner(editingDiner === diner.id ? null : diner.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
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
                {diner.items.map((item, index) => {
                  const billItem = bill.bill_items.find(bi => bi.id === item.itemId);
                  if (!billItem) return null;

                  return (
                    <div 
                      key={item.itemId} 
                      className={cn(
                        "flex justify-between text-sm items-center p-2 rounded-lg",
                        index % 2 === 0 ? "bg-transparent" : "bg-muted/50"
                      )}
                    >
                      <span className="text-muted-foreground">
                        {item.quantity}x {billItem.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>
                          R{(billItem.price * item.quantity).toFixed(2)}
                        </span>
                        {editingDiner === diner.id && (
                          <button
                            onClick={() => handleDeleteItem(diner.id, item.itemId)}
                            className="text-muted-foreground hover:text-red-600 transition-colors p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {diner.tip_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <div className="flex items-center gap-2">
                      <span>Tip</span>
                      <Badge variant="secondary" className="text-xs">
                        {((diner.tip_amount / (diner.total - diner.tip_amount)) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <span>R{diner.tip_amount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <Separator />
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Paid</span>
              <span className="text-xl font-bold">
                R{totalPaid.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-medium">Total Bill</span>
              <span className="text-medium">
                R{bill.total_amount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center font-medium">
              {outstandingAmount < 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span>Tip Amount</span>
                    <Badge variant="secondary" className="text-xs">
                      {((Math.abs(outstandingAmount) / bill.total_amount) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  <span className="text-green-600">
                    R{Math.abs(outstandingAmount).toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  <span>Outstanding Amount</span>
                  <span className="text-red-600">
                    R{outstandingAmount.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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