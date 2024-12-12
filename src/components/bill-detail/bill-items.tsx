import { useState } from 'react';
import { useSessionContext } from '@/components/providers/session-provider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { supabase } from '@/lib/supabase/config';
import type { Bill, BillItem } from '@/types/database';

interface BillItemsProps {
  bill: Bill;
}

export function BillItems({ bill }: BillItemsProps) {
  const [activeCategory, setActiveCategory] = useState<'Drinks' | 'Food' | 'Desserts'>('Food');
  const { session } = useSessionContext();

  const handleClaimItem = async (item: BillItem) => {
    if (!session) return;
    
    const updatedItems = bill.items.map(i => 
      i.id === item.id ? { ...i, assigned_to: session.id } : i
    );

    const { error } = await supabase
      .from('bills')
      .update({ items: updatedItems })
      .eq('id', bill.id);

    if (error) {
      console.error('Failed to claim item:', error);
    }
  };

  const getParticipantName = (participantId: string) => {
    const participant = bill.participants.find(p => p.id === participantId);
    return participant?.name || 'Unknown';
  };

  const categoryItems = bill.items.filter(item => item.category === activeCategory);

  return (
    <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)}>
      <TabsList className="w-full">
        <TabsTrigger value="Drinks" className="flex-1">Drinks</TabsTrigger>
        <TabsTrigger value="Food" className="flex-1">Food</TabsTrigger>
        <TabsTrigger value="Desserts" className="flex-1">Desserts</TabsTrigger>
      </TabsList>

      {['Drinks', 'Food', 'Desserts'].map((category) => (
        <TabsContent key={category} value={category} className="space-y-4">
          {categoryItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-400">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                {item.assigned_to ? (
                  <span className="text-sm text-gray-400">
                    Claimed by {getParticipantName(item.assigned_to)}
                  </span>
                ) : (
                  session && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClaimItem(item)}
                    >
                      Claim Item
                    </Button>
                  )
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}