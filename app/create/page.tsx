"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BillSkeleton } from '@/components/bill-skeleton';
import { Button } from "@/components/ui/button";
import { analytics } from '@/lib/posthog';
import { PreviewStep } from './components/PreviewStep';
import { ErrorState } from './components/ErrorState';
import { ProcessingStatus, ExtractedItem } from './types';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function CreateBillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billId = searchParams.get('billId');
  
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If we're editing an existing bill
    if (billId) {
      const storedItems = sessionStorage.getItem(`bill-${billId}-items`);
      if (storedItems) {
        setExtractedItems(JSON.parse(storedItems));
        setStatus('done');
        return;
      }
    }

    // Otherwise process the new image
    const capturedImage = sessionStorage.getItem('capturedImage');
    if (!capturedImage) {
      router.push('/');
      return;
    }

    const processImage = async () => {
      setStatus('processing');
      try {
        const response = await fetch('/api/process-bill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: capturedImage }),
        });

        if (!response.ok) throw new Error('Failed to process image');

        const data = await response.json();
        setExtractedItems(data.items);
        setStatus('done');
        // Clear the image from sessionStorage after processing
        sessionStorage.removeItem('capturedImage');
      } catch (error) {
        console.error('Error processing image:', error);
        setStatus('error');
      }
    };

    processImage();
  }, [router, billId]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const totalAmount = extractedItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      const endpoint = billId ? `/api/bills/${billId}` : '/api/bills';
      const method = billId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: extractedItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category
          })),
          totalAmount
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${billId ? 'update' : 'create'} bill`);
      }

      const bill = await response.json();
      const finalBillId = billId || bill.billId;

      // Store items in session storage for editing later
      sessionStorage.setItem(`bill-${finalBillId}-items`, JSON.stringify(extractedItems));

      // Track bill action
      if (billId) {
        analytics.billEdited({
          billId: finalBillId,
          totalAmount,
          itemCount: extractedItems.length
        });
      } else {
        analytics.billCreated({
          totalAmount,
          itemCount: extractedItems.length,
          creatorName: 'anonymous'
        });
      }

      router.push(`/bills/${finalBillId}`);
    } catch (error) {
      console.error('Error handling bill:', error);
      toast.error(error instanceof Error ? error.message : `Failed to ${billId ? 'update' : 'create'} bill`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = extractedItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  if (status === 'processing') {
    return (
      <main className="min-h-screen p-4">
        <div className="max-w-md mx-auto space-y-4">
          <BillSkeleton />
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen p-4">
        <div className="max-w-md mx-auto space-y-4">
          <ErrorState />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        <PreviewStep 
          items={extractedItems} 
          onUpdateItems={setExtractedItems} 
        />
        
        <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-lg font-semibold">R{totalAmount.toFixed(2)}</p>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || extractedItems.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {billId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              billId ? 'Update Bill' : 'Create Bill'
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function CreateBill() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateBillContent />
    </Suspense>
  );
} 