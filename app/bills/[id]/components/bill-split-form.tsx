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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { UtensilsCrossed, Wine, PartyPopper, ArrowRight, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/lib/utils'
import { toast } from "sonner"
import { CATEGORY_ORDER } from "@/app/create/types"

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

export function BillSplitForm({ bill, onTabChange }: { bill: Bill; onTabChange: (tab: string) => void }) {
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
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const remainingQty = getRemainingQuantity(itemId);

    setItems(items.map(i => 
      i.id === itemId 
        ? { 
            ...i, 
            selected: checked, 
            myQuantity: checked ? (i.quantity === 1 || remainingQty === 1 ? 1 : 0) : 0 
          }
        : i
    ));
  }

  const handleQuantityChange = (itemId: string, value: number[]) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    const newQuantity = value[0]

    setItems(items.map(i =>
      i.id === itemId
        ? { ...i, myQuantity: newQuantity }
        : i
    ))
  }

  const subtotal = items.reduce((sum, item) => 
    sum + (item.selected ? item.price * (item.myQuantity || 0) : 0), 
    0
  )

  const tipAmount = (subtotal * tipPercentage) / 100
  const total = subtotal + tipAmount

  const selectedItems = items.filter(i => i.selected)

  const handleTipSelect = (value: number) => {
    setTipPercentage(value)
    setIsCustomTip(false)
  }

  const handleCustomTip = () => {
    setIsCustomTip(true)
  }

  const handleLockIn = async () => {
    // Check if any selected items are missing quantities
    const invalidItems = selectedItems.filter(item => 
      item.selected && (!item.myQuantity || item.myQuantity === 0)
    );

    if (invalidItems.length > 0) {
      // For items with quantity 1 or remaining 1, automatically set their quantity
      const updatedItems = items.map(item => {
        if (invalidItems.some(i => i.id === item.id)) {
          const remainingQty = getRemainingQuantity(item.id);
          if (item.quantity === 1 || remainingQty === 1) {
            return { ...item, myQuantity: 1 };
          }
        }
        return item;
      });
      
      setItems(updatedItems);
      
      // Check if there are still any items without quantities
      const stillInvalidItems = updatedItems.filter(item => 
        item.selected && (!item.myQuantity || item.myQuantity === 0)
      );
      
      if (stillInvalidItems.length > 0) {
        toast.error('Please specify quantities for all selected items');
        return;
      }
    }

    setIsNameDialogOpen(true);
  };

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
    if (!existingDiner && !dinerName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      const endpoint = existingDiner 
        ? `/api/diners/${existingDiner.id}/items`
        : '/api/diners';

      const selectedItemsData = selectedItems
        .filter(item => item.selected && (item.myQuantity || 0) > 0)
        .map(item => ({
          itemId: item.id,
          quantity: item.myQuantity || 0,
        }));

      if (selectedItemsData.length === 0) {
        toast.error('Please select at least one item and specify quantities');
        return;
      }

      const requestBody = existingDiner ? {
        items: selectedItemsData,
        tipAmount: Number(tipAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
      } : {
        billId: bill.id,
        name: dinerName.trim(),
        items: selectedItemsData,
        tipAmount: Number(tipAmount.toFixed(2)),
        total: Number(total.toFixed(2)),
      };

      console.log('Sending request:', {
        endpoint,
        method: existingDiner ? 'PUT' : 'POST',
        body: requestBody
      });

      const response = await fetch(endpoint, {
        method: existingDiner ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save selections');
      }

      setIsNameDialogOpen(false);
      resetSelections();
      setCurrentDiner(null);
      router.refresh();
    } catch (error) {
      console.error('Error saving selections:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save selections');
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

  const getItemTotal = (item: BillItem) => {
    const quantity = item.myQuantity || 0
    return item.selected && quantity > 1 
      ? item.price * quantity 
      : item.price
  }

  // Separate items into available and accounted for
  const categorizeItems = () => {
    const available: Record<string, BillItem[]> = {};
    const accountedFor: BillItem[] = [];

    items.forEach(item => {
      const remainingQuantity = getRemainingQuantity(item.id);
      if (remainingQuantity === 0) {
        accountedFor.push(item);
      } else {
        const category = item.category;
        if (!available[category]) {
          available[category] = [];
        }
        available[category].push(item);
      }
    });

    return { available, accountedFor };
  };

  const { available, accountedFor } = categorizeItems();

  // Add this function to check if all items are accounted for
  const areAllItemsAccountedFor = () => {
    return bill.bill_items.every(item => {
      const totalAssigned = bill.diners.reduce((sum, diner) => {
        const dinerItem = diner.items.find(i => i.itemId === item.id);
        return sum + (dinerItem?.quantity || 0);
      }, 0);
      return totalAssigned === item.quantity;
    });
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Happy Split Bill',
        text: 'Join me in splitting this bill!',
        url: `${window.location.origin}/bills/${bill.id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support native sharing
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Bill link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Only show error if it's not a user cancellation
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Failed to share bill');
      }
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
          {/* Success State */}
          {areAllItemsAccountedFor() && (
            <div className="rounded-lg border bg-card text-card-foreground p-6 space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto">
                <PartyPopper className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-lg font-medium">All items accounted for!</h3>
                <p className="text-sm text-muted-foreground">
                  Great job! Check the summary tab to review the split.
                </p>
              </div>
              <Button 
                onClick={() => onTabChange('summary')}
                className="w-full flex items-center justify-center gap-2"
              >
                View Summary
                <ArrowRight className="w-4 w-4" />
              </Button>
            </div>
          )}

          {/* Available Items */}
          {CATEGORY_ORDER.map(category => {
            const categoryItems = available[category];
            if (!categoryItems?.length) return null;

            return (
              <div key={category} className="space-y-4 mb-8">
                <div className="flex items-center gap-2">
                  {category === 'Drinks' ? (
                    <Wine className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                  )}
                  <h2 className="font-semibold text-lg">{category}</h2>
                </div>
                <div className="space-y-1">
                  {categoryItems.map((item, index) => {
                    const remainingQuantity = getRemainingQuantity(item.id);
                    const selectedBy = getSelectedBy(item.id);

                    return (
                      <div key={item.id} className={cn(
                        "space-y-2 p-2 rounded-lg",
                        index % 2 === 0 ? "bg-transparent" : "bg-muted/50"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Checkbox
                              id={item.id}
                              checked={item.selected}
                              onCheckedChange={(checked) => 
                                handleItemSelect(item.id, checked as boolean)
                              }
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
                            {item.quantity > 1 && remainingQuantity > 1 && (
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
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Accounted For Items */}
          {accountedFor.length > 0 && (
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">Accounted For</h2>
                <Badge variant="secondary" className="text-xs">
                  {accountedFor.length}
                </Badge>
              </div>
              <div className="space-y-1">
                {accountedFor.map((item, index) => {
                  const selectedBy = getSelectedBy(item.id);
                  return (
                    <div key={item.id} className={cn(
                      "space-y-2 p-2 rounded-lg opacity-50",
                      index % 2 === 0 ? "bg-transparent" : "bg-muted/50"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <Checkbox
                            id={`accounted-${item.id}`}
                            checked={true}
                            disabled={true}
                            className="flex-shrink-0"
                          />
                          <Label 
                            htmlFor={`accounted-${item.id}`}
                            className="font-medium flex items-center gap-2 flex-1 min-w-0"
                          >
                            <span className="text-sm text-muted-foreground flex-shrink-0">
                              {item.quantity} ·
                            </span>
                            <span className="flex items-center gap-2 min-w-0 flex-1 line-through">
                              <span className="truncate">{item.name}</span>
                              <div className="flex flex-wrap gap-1 flex-shrink-0">
                                {selectedBy.map(name => (
                                  <Badge 
                                    key={name}
                                    variant="secondary" 
                                    className="text-xs text-muted-foreground"
                                  >
                                    {name}•{bill.diners.find(d => d.name === name)?.items.find(i => i.itemId === item.id)?.quantity || 0}
                                  </Badge>
                                ))}
                              </div>
                            </span>
                          </Label>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-medium tabular-nums">
                            R{formatPrice(getItemTotal(item))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {/* Total and Lock In */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{selectedItems.length} items</span>
              </div>
              <div className="text-lg font-bold">
                R{formatPrice(total)}
              </div>
            </div>
            
            {selectedItems.length > 0 && (
              <>
                <Button
                  onClick={handleLockIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Lock in selections
                </Button>

                {/* Share Bill Button */}
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share Bill</span>
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">{bill.id}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

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
                        onClick={() => handleSubmitDiner(diner)}
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