'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/lib/utils'

interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  category: 'Food' | 'Drinks' | 'Desserts'
  unit?: string
  selected?: boolean
  myQuantity?: number
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export function BillSplitForm({ bill }: { bill: Bill }) {
  const router = useRouter()
  
  // Initialize items with server state
  const [items, setItems] = useState<BillItem[]>(() => {
    return bill.bill_items.map((item) => ({
      ...item,
      selected: false,
      myQuantity: 0,
    }));
  });

  const [tipPercentage, setTipPercentage] = useState(0)

  const [isCustomTip, setIsCustomTip] = useState(false)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [dinerName, setDinerName] = useState("")
  const [currentDiner, setCurrentDiner] = useState<string | null>(null);

  const tipPresets = [
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '20%', value: 20 },
  ]

  const handleItemSelect = (itemId: string, checked: boolean) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            selected: checked, 
            myQuantity: checked ? (item.quantity === 1 ? 1 : 0) : 0 
          }
        : item
    ))
  }

  const handleQuantityChange = (itemId: string, value: number[]) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, myQuantity: value[0] }
        : item
    ))
  }

  const subtotal = items.reduce((sum, item) => 
    sum + (item.selected ? item.price * (item.myQuantity || 0) : 0), 
    0
  )

  const tipAmount = (subtotal * tipPercentage) / 100
  const total = subtotal + tipAmount

  // Group items by category
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
    return groups
  }, {} as Record<string, BillItem[]>)

  const selectedItems = items.filter(i => i.selected)

  const handleTipSelect = (value: number) => {
    setTipPercentage(value)
    setIsCustomTip(false)
  }

  const handleCustomTip = () => {
    setIsCustomTip(true)
  }

  const handleLockIn = async () => {
    if (!selectedItems.length) return
    setIsNameDialogOpen(true)
  }

  const resetSelections = () => {
    setItems(items.map(item => ({
      ...item,
      selected: false,
      myQuantity: 0
    })));
    setTipPercentage(0);
    setIsCustomTip(false);
    setDinerName("");
  };

  const handleSubmitDiner = async (existingDiner?: Diner) => {
    if (!dinerName.trim()) return;

    try {
      const endpoint = existingDiner 
        ? `/api/diners/${existingDiner.id}/items` // Update existing diner's items
        : '/api/diners'; // Create new diner

      const response = await fetch(endpoint, {
        method: existingDiner ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(existingDiner ? {
          items: selectedItems.map(item => ({
            itemId: item.id,
            quantity: item.myQuantity,
          })),
          tipAmount,
          total,
        } : {
          billId: bill.id,
          name: dinerName,
          items: selectedItems.map(item => ({
            itemId: item.id,
            quantity: item.myQuantity,
          })),
          tipAmount,
          total,
        }),
      });

      if (!response.ok) throw new Error('Failed to save selections');

      setIsNameDialogOpen(false);
      resetSelections();
      setCurrentDiner(null);
      router.refresh();
    } catch (error) {
      console.error('Error saving selections:', error);
    }
  };

  // Calculate remaining quantities for each item
  const getRemainingQuantity = (itemId: string) => {
    const takenQuantity = bill.diners.reduce((sum, diner) => {
      const dinerItem = diner.items.find(item => item.itemId === itemId)
      return sum + (dinerItem?.quantity || 0)
    }, 0)

    const item = bill.bill_items.find(item => item.id === itemId)
    return item ? item.quantity - takenQuantity : 0
  }

  // Modify getSelectedBy to exclude current diner
  const getSelectedBy = (itemId: string): string[] => {
    return bill.diners
      .filter(diner => 
        diner.name !== currentDiner && // Exclude current diner
        diner.items.some(item => item.itemId === itemId)
      )
      .map(diner => diner.name);
  };

  useEffect(() => {
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
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bill.id, router])

  useEffect(() => {
    const savedItems = localStorage.getItem(`bill-${bill.id}-items`)
    const savedTip = localStorage.getItem(`bill-${bill.id}-tip`)

    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
    if (savedTip) {
      setTipPercentage(parseInt(savedTip))
    }
  }, [bill.id])

  useEffect(() => {
    localStorage.setItem(`bill-${bill.id}-items`, JSON.stringify(items))
  }, [items, bill.id])

  useEffect(() => {
    localStorage.setItem(`bill-${bill.id}-tip`, tipPercentage.toString())
  }, [tipPercentage, bill.id])

  // Calculate total paid and outstanding amount
  const totalPaid = bill.diners.reduce((sum, diner) => sum + diner.total, 0)
  const outstandingAmount = bill.total_amount - totalPaid

  const getItemTotal = (item: BillItem) => {
    const quantity = item.myQuantity || 0
    return item.selected && quantity > 1 
      ? item.price * quantity 
      : item.price
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {currentDiner ? (
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">
                  Selecting items for
                </span>
                <span>{currentDiner}</span>
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                <span>Select Your Items</span>
                {bill.diners.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {bill.diners.length} {bill.diners.length === 1 ? 'person has' : 'people have'} joined
                  </span>
                )}
              </div>
            )}
          </CardTitle>
          {outstandingAmount > 0 && (
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-muted-foreground">Outstanding Amount</span>
              <span className="text-red-600 font-medium">
                R{formatPrice(outstandingAmount)}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-4">
              <h2 className="font-semibold text-lg">{category}</h2>
              <div className="space-y-1">
                {categoryItems.map((item, index) => {
                  const remainingQuantity = getRemainingQuantity(item.id)
                  const selectedBy = getSelectedBy(item.id)
                  const isFullyTaken = remainingQuantity === 0

                  return (
                    <div key={item.id} className={cn(
                      "space-y-2 p-2 rounded-lg",
                      index % 2 === 0 ? "bg-transparent" : "bg-muted/50",
                      isFullyTaken && "opacity-50"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Checkbox
                            id={item.id}
                            checked={item.selected}
                            onCheckedChange={(checked) => 
                              handleItemSelect(item.id, checked as boolean)
                            }
                            // Only disable if ALL quantities have been taken
                            disabled={remainingQuantity === 0}
                            className="flex-shrink-0"
                          />
                          <Label 
                            htmlFor={item.id} 
                            className="font-medium flex items-center gap-2 flex-1 min-w-0"
                          >
                            <span className="text-sm text-muted-foreground flex-shrink-0">
                              {item.quantity > 1 
                                ? (item.selected 
                                    ? `${item.myQuantity}/${remainingQuantity}` 
                                    : remainingQuantity)
                                : "1"} ·
                            </span>
                            <span className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="truncate">{item.name}</span>
                              {selectedBy.length > 0 && (
                                <div className="flex flex-wrap gap-1 flex-shrink-0">
                                  {selectedBy.length > 1 ? (
                                    <>
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs text-muted-foreground"
                                      >
                                        {selectedBy[0]}•{bill.diners.find(d => d.name === selectedBy[0])?.items.find(i => i.itemId === item.id)?.quantity || 0}
                                      </Badge>
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs text-muted-foreground"
                                      >
                                        +{selectedBy.length - 1}
                                      </Badge>
                                    </>
                                  ) : (
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs text-muted-foreground"
                                    >
                                      {selectedBy[0]}•{bill.diners.find(d => d.name === selectedBy[0])?.items.find(i => i.itemId === item.id)?.quantity || 0}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </span>
                          </Label>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-medium tabular-nums">
                            R{formatPrice(getItemTotal(item))}
                          </div>
                        </div>
                      </div>

                      {item.selected && (
                        <div className="pl-6 space-y-2">
                          {item.quantity > 1 && remainingQuantity > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-end">
                                <div className="text-xs text-muted-foreground">
                                  R{formatPrice(item.price)} per item
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Slider
                                  value={[item.myQuantity || 0]}
                                  min={0}
                                  max={remainingQuantity}
                                  step={1}
                                  onValueChange={(value) => handleQuantityChange(item.id, value)}
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <Separator className="my-4" />
          
          {/* Tip Section */}
          {subtotal > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Add Tip</span>
                <span className={cn(
                  "font-medium text-sm",
                  tipPercentage > 0 ? "text-green-600" : "text-muted-foreground"
                )}>
                  {tipPercentage > 0 && `R${tipAmount.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex gap-2">
                {tipPresets.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => handleTipSelect(preset.value)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                      tipPercentage === preset.value && !isCustomTip
                        ? "bg-green-600 text-white"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={handleCustomTip}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                    isCustomTip
                      ? "bg-green-600 text-white"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                >
                  Custom
                </button>
              </div>

              {isCustomTip && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Custom amount
                    </span>
                    <span className="text-sm font-medium">
                      {tipPercentage}%
                    </span>
                  </div>
                  <Slider
                    value={[tipPercentage]}
                    min={0}
                    max={30}
                    step={1}
                    onValueChange={([value]) => setTipPercentage(value)}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* Total Section */}
          <div className="space-y-2">
            <Collapsible>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>My selection</span>
                  <span>•</span>
                  <span>{selectedItems.length}</span>
                  <CollapsibleTrigger className="hover:text-foreground transition-colors">
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                </div>
                <span className="tabular-nums">R{formatPrice(subtotal)}</span>
              </div>
              <CollapsibleContent className="pt-2">
                <div className="space-y-1 text-sm text-muted-foreground">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="text-xs">
                            ({item.myQuantity || 0}/{item.quantity})
                          </span>
                        )}
                      </span>
                      <span>
                        R{getItemTotal(item).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {tipAmount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Tip</span>
                <span className="tabular-nums">R{formatPrice(tipAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <div className="font-medium">Total</div>
              <div className="text-lg font-bold">
                R{total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Lock In and Add Another Diner buttons */}
          <div className="space-y-2">
            {selectedItems.length > 0 && (
              <Button
                onClick={handleLockIn}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Lock in selections
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Name Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Bill</DialogTitle>
            <DialogDescription>
              {bill.diners.length > 0 
                ? "Add these items to an existing person or create a new entry"
                : "Enter your name to add these items"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {bill.diners.length > 0 && (
              <>
                <div className="space-y-4">
                  <div className="text-sm font-medium">Existing People</div>
                  <div className="grid grid-cols-2 gap-2">
                    {bill.diners.map((diner) => (
                      <Button
                        key={diner.id}
                        variant="outline"
                        className="w-full justify-start font-normal"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/diners/${diner.id}/items`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                items: selectedItems.map(item => ({
                                  itemId: item.id,
                                  quantity: item.myQuantity,
                                })),
                                tipAmount,
                                total,
                              }),
                            });

                            if (!response.ok) throw new Error('Failed to save selections');

                            setIsNameDialogOpen(false);
                            resetSelections();
                            setCurrentDiner(null);
                            router.refresh();
                          } catch (error) {
                            console.error('Error saving selections:', error);
                          }
                        }}
                      >
                        {diner.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or add new
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-4">
              <Input
                placeholder="Enter name"
                value={dinerName}
                onChange={(e) => setDinerName(e.target.value)}
              />
              <Button
                onClick={() => handleSubmitDiner()}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {bill.diners.length > 0 ? "Add as New Person" : "Add to Bill"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 