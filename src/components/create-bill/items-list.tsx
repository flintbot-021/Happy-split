'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils/currency';
import { X } from 'lucide-react';
import type { BillItem } from '@/types/database';

interface ItemsListProps {
  items: BillItem[];
  onItemsChange: (items: BillItem[]) => void;
}

export function ItemsList({ items, onItemsChange }: ItemsListProps) {
  const handleItemUpdate = (updatedItem: BillItem) => {
    const newItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    onItemsChange(newItems);
  };

  const handleAddItem = (category: 'Drinks' | 'Food' | 'Desserts') => {
    const newItem: BillItem = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      price: 0,
      category,
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="Food">
        <TabsList className="w-full">
          <TabsTrigger value="Drinks" className="flex-1">Drinks</TabsTrigger>
          <TabsTrigger value="Food" className="flex-1">Food</TabsTrigger>
          <TabsTrigger value="Desserts" className="flex-1">Desserts</TabsTrigger>
        </TabsList>

        {['Drinks', 'Food', 'Desserts'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {items
              .filter(item => item.category === category)
              .map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Label htmlFor={`name-${item.id}`}>Item Name</Label>
                    <Input
                      id={`name-${item.id}`}
                      value={item.name}
                      onChange={(e) => handleItemUpdate({ ...item, name: e.target.value })}
                      className="bg-white/10"
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`quantity-${item.id}`}>Qty</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemUpdate({ 
                        ...item, 
                        quantity: parseInt(e.target.value) || 1 
                      })}
                      className="bg-white/10"
                    />
                  </div>
                  <div className="w-32">
                    <Label htmlFor={`price-${item.id}`}>Price</Label>
                    <Input
                      id={`price-${item.id}`}
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemUpdate({ 
                        ...item, 
                        price: parseFloat(e.target.value) || 0 
                      })}
                      className="bg-white/10"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            <Button 
              variant="outline" 
              onClick={() => handleAddItem(category as any)}
            >
              Add {category.slice(0, -1)}
            </Button>
          </TabsContent>
        ))}
      </Tabs>

      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-lg">Total:</span>
          <span className="text-2xl font-bold">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}