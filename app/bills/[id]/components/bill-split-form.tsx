'use client'

import { useState } from "react"
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

interface Bill {
  id: string
  total_amount: number
  bill_items: BillItem[]
}

export function BillSplitForm({ bill }: { bill: Bill }) {
  const router = useRouter()
  const [items, setItems] = useState<BillItem[]>(
    bill.bill_items.map((item) => ({
      ...item,
      selected: false,
      myQuantity: 0,
    }))
  )
  const [tipPercentage, setTipPercentage] = useState(0)
  const [isCustomTip, setIsCustomTip] = useState(false)
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false)
  const [dinerName, setDinerName] = useState("")

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

  const getUnitLabel = (item: BillItem) => {
    if (item.unit) return item.unit
    switch (item.category) {
      case 'Drinks':
        return 'glass'
      case 'Food':
        return 'portion'
      default:
        return 'item'
    }
  }

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

  const handleSubmitDiner = async () => {
    if (!dinerName.trim()) return

    const dinerData = {
      billId: bill.id,
      name: dinerName,
      items: selectedItems.map(item => ({
        itemId: item.id,
        quantity: item.myQuantity,
      })),
      tipAmount: tipAmount,
      total: total,
    }

    try {
      const response = await fetch('/api/diners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dinerData),
      })

      if (!response.ok) throw new Error('Failed to save diner')

      // Close the dialog
      setIsNameDialogOpen(false)
      
      // Refresh the page to update the data
      router.refresh()

      // Find the tabs element and switch to summary
      const summaryTab = document.querySelector('[value="summary"]') as HTMLButtonElement
      if (summaryTab) {
        summaryTab.click()
      }
    } catch (error) {
      console.error('Error saving diner:', error)
      // Add error handling here
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Select Your Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="space-y-4">
              <h2 className="font-semibold text-lg">{category}</h2>
              <div className="space-y-4">
                {categoryItems.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={item.id}
                          checked={item.selected}
                          onCheckedChange={(checked) => 
                            handleItemSelect(item.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={item.id} className="font-medium flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.quantity > 1 
                              ? (item.selected ? `${item.myQuantity}/${item.quantity}` : item.quantity)
                              : "1"} ·
                          </span>
                          {item.name}
                        </Label>
                      </div>
                      <div className="text-right font-medium">
                        R{item.selected && item.myQuantity > 1 
                          ? (item.price * item.myQuantity).toFixed(2) 
                          : item.price.toFixed(2)}
                      </div>
                    </div>

                    {item.selected && (
                      <div className="pl-6 space-y-2">
                        {item.quantity > 1 ? (
                          <div className="space-y-2">
                            <div className="flex justify-end">
                              <div>

                                <div className="text-xs text-muted-foreground">
                                  R{item.price.toFixed(2)} per item
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Slider
                                value={[item.myQuantity || 0]}
                                min={0}
                                max={item.quantity}
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
                ))}
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
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>R{subtotal.toFixed(2)}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Tip</span>
                <span>R{tipAmount.toFixed(2)}</span>
              </div>
            )}
            <Collapsible>
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <div className="font-medium">Total</div>
                  <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronDown className="h-4 w-4" />
                    {selectedItems.length} items selected
                  </CollapsibleTrigger>
                </div>
                <div className="text-lg font-bold">
                  R{total.toFixed(2)}
                </div>
              </div>
              <CollapsibleContent className="pt-2">
                <div className="space-y-1 text-sm text-muted-foreground">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="text-xs">
                            ({item.myQuantity}/{item.quantity})
                          </span>
                        )}
                      </span>
                      <span>
                        R{(item.price * item.myQuantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Lock In Button */}
          {selectedItems.length > 0 && (
            <Button
              onClick={handleLockIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Lock in my selections
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Name Dialog */}
      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Your Name</DialogTitle>
            <DialogDescription>
              Enter your name to lock in your selections
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Your name"
              value={dinerName}
              onChange={(e) => setDinerName(e.target.value)}
            />
            <Button
              onClick={handleSubmitDiner}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 