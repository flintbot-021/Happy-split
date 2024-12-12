'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionContext } from '@/providers/session-provider';
import { useToast } from '@/components/ui/use-toast';
import { ReceiptInput } from './receipt-input';
import { ItemsList } from './items-list';
import { Button } from '@/components/ui/button';
import { createBill } from '@/lib/supabase/bills';
import { processReceipt } from '@/lib/services/receipt-service';
import { logError } from '@/lib/utils/error-handler';
import type { BillItem } from '@/types/database';

export function CreateBillForm() {
  const [step, setStep] = useState<'capture' | 'review'>('capture');
  const [items, setItems] = useState<BillItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { session, createSession } = useSessionContext();
  const { toast } = useToast();
  const router = useRouter();

  const handleImageCapture = async (base64Image: string) => {
    setIsProcessing(true);
    try {
      const processedItems = await processReceipt(base64Image);
      setItems(processedItems);
      setStep('review');
    } catch (error) {
      logError('Image Capture', error);
      toast({
        title: 'Error Processing Receipt',
        description: error instanceof Error 
          ? error.message 
          : 'Please try again or enter items manually.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateBill = async () => {
    if (!session?.name) {
      toast({
        title: 'Error',
        description: 'Please enter your name first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const participant = {
        id: session.id,
        name: session.name,
        tip_percentage: 10,
        subtotal: 0,
      };

      const bill = await createBill(items, participant);
      createSession(session.name, bill.id);
      router.push(`/bill/${bill.id}`);
    } catch (error) {
      logError('Create Bill', error);
      toast({
        title: 'Error Creating Bill',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to create bill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'capture' ? (
        <ReceiptInput 
          onCapture={handleImageCapture} 
          isProcessing={isProcessing} 
        />
      ) : (
        <div className="space-y-6">
          <ItemsList 
            items={items} 
            onItemsChange={setItems} 
          />
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setStep('capture')}
              disabled={isProcessing}
            >
              Back to Capture
            </Button>
            <Button
              onClick={handleCreateBill}
              disabled={isProcessing || items.length === 0}
            >
              Create Bill
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}