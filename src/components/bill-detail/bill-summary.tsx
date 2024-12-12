import { useState } from 'react';
import { useSessionContext } from '@/components/providers/session-provider';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils/currency';
import { supabase } from '@/lib/supabase/config';
import type { Bill } from '@/types/database';

interface BillSummaryProps {
  bill: Bill;
}

export function BillSummary({ bill }: BillSummaryProps) {
  const { session } = useSessionContext();
  const [isUpdatingTip, setIsUpdatingTip] = useState(false);

  const participant = session 
    ? bill.participants.find(p => p.id === session.id)
    : null;

  const calculateParticipantSubtotal = (participantId: string) => {
    return bill.items
      .filter(item => item.assigned_to === participantId)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleTipChange = async (value: number[]) => {
    if (!session || isUpdatingTip) return;
    
    setIsUpdatingTip(true);
    try {
      const updatedParticipants = bill.participants.map(p =>
        p.id === session.id ? { ...p, tip_percentage: value[0] } : p
      );

      await supabase
        .from('bills')
        .update({ participants: updatedParticipants })
        .eq('id', bill.id);
    } finally {
      setIsUpdatingTip(false);
    }
  };

  const yourSubtotal = participant ? calculateParticipantSubtotal(participant.id) : 0;
  const yourTip = participant ? (yourSubtotal * participant.tip_percentage / 100) : 0;
  const yourTotal = yourSubtotal + yourTip;

  const totalItems = bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalTips = bill.participants.reduce((sum, p) => {
    const subtotal = calculateParticipantSubtotal(p.id);
    return sum + (subtotal * p.tip_percentage / 100);
  }, 0);
  const grandTotal = totalItems + totalTips;

  return (
    <div className="space-y-6 p-4 rounded-lg bg-white/5">
      {participant && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Portion</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span>{formatCurrency(yourSubtotal)}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tip</span>
                <span>{participant.tip_percentage}%</span>
              </div>
              <Slider
                value={[participant.tip_percentage]}
                onValueChange={handleTipChange}
                max={50}
                step={1}
                className="w-full"
                disabled={isUpdatingTip}
              />
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-gray-700">
              <span>Your Total</span>
              <span>{formatCurrency(yourTotal)}</span>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">All Participants</h2>
        <div className="space-y-2">
          {bill.participants.map((p) => {
            const subtotal = calculateParticipantSubtotal(p.id);
            const tip = subtotal * p.tip_percentage / 100;
            const total = subtotal + tip;
            
            return (
              <div key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            );
          })}
          <div className="flex justify-between font-semibold pt-2 border-t border-gray-700">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}