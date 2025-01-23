"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BillSkeleton } from '@/components/bill-skeleton';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, AlertCircle, UtensilsCrossed, Wine, Check, X } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { analytics } from '@/lib/posthog'

type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';
type Category = 'Food' | 'Drinks' | 'Desserts';

interface ExtractedItem {
  name: string;
  price: number;
  quantity: number;
  category?: Category;
}

export default function CreateBill() {
  const router = useRouter();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ExtractedItem | null>(null);

  useEffect(() => {
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
  }, [router]);

  const startEditing = (item: ExtractedItem, index: number) => {
    setEditingItem(index);
    setEditForm({ ...item });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditForm(null);
  };

  const saveEdit = (index: number) => {
    if (editForm) {
      setExtractedItems(items =>
        items.map((item, i) =>
          i === index ? editForm : item
        )
      );
      setEditingItem(null);
      setEditForm(null);
    }
  };

  const handleDeleteItem = (index: number) => {
    setExtractedItems(items => items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: extractedItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create bill')
      }

      const bill = await response.json()

      // Track bill creation
      analytics.billCreated({
        totalAmount: extractedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        itemCount: extractedItems.length,
        creatorName: 'anonymous' // You might want to add user authentication later
      })

      router.push(`/bills/${bill.id}`)
    } catch (error) {
      console.error('Error creating bill:', error)
    }
  }

  const groupedItems = extractedItems.reduce((acc, item) => {
    const category = item.category || 'Food';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<Category, ExtractedItem[]>);

  const totalAmount = extractedItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  const renderEditForm = (item: ExtractedItem, index: number) => (
    <div className="flex-1 space-y-2">
      <input
        type="text"
        value={editForm?.name || ''}
        onChange={e => setEditForm(prev => prev ? { ...prev, name: e.target.value } : null)}
        className="w-full p-1 border rounded"
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={editForm?.quantity || 0}
          onChange={e => setEditForm(prev => prev ? { ...prev, quantity: Number(e.target.value) } : null)}
          className="w-20 p-1 border rounded"
        />
        <input
          type="number"
          value={editForm?.price || 0}
          onChange={e => setEditForm(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
          className="w-24 p-1 border rounded"
          step="0.01"
        />
        <select
          value={editForm?.category || 'Food'}
          onChange={e => setEditForm(prev => prev ? { ...prev, category: e.target.value as Category } : null)}
          className="p-1 border rounded"
        >
          <option value="Food">Food</option>
          <option value="Drinks">Drinks</option>
          <option value="Desserts">Desserts</option>
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => saveEdit(index)}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <Check size={16} />
          </button>
          <button
            onClick={cancelEditing}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto space-y-4">
        {status === 'processing' ? (
          <BillSkeleton />
        ) : status === 'error' ? (
          <Card className="p-4 border-destructive">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <h3 className="font-semibold">Failed to Process Bill</h3>
              <p className="text-sm text-muted-foreground">
                There was an error processing your bill. Please try again.
              </p>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Confirm Items</h2>
              
              <div className="space-y-6">
                {/* Food Section */}
                {groupedItems.Food?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Food</h3>
                    </div>
                    <ul className="space-y-3">
                      {groupedItems.Food.map((item, index) => (
                        <li 
                          key={`food-${index}`}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                        >
                          {editingItem === extractedItems.indexOf(item) ? (
                            renderEditForm(item, extractedItems.indexOf(item))
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity}x · R{item.price.toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditing(item, extractedItems.indexOf(item))}
                                  className="p-1 text-gray-600 hover:text-blue-600"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(extractedItems.indexOf(item))}
                                  className="p-1 text-gray-600 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Drinks Section */}
                {groupedItems.Drinks?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Wine className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Drinks</h3>
                    </div>
                    <ul className="space-y-3">
                      {groupedItems.Drinks.map((item, index) => (
                        <li 
                          key={`drinks-${index}`}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                        >
                          {editingItem === extractedItems.indexOf(item) ? (
                            renderEditForm(item, extractedItems.indexOf(item))
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity}x · R{item.price.toFixed(2)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditing(item, extractedItems.indexOf(item))}
                                  className="p-1 text-gray-600 hover:text-blue-600"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(extractedItems.indexOf(item))}
                                  className="p-1 text-gray-600 hover:text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                size="lg"
                className="flex-1"
              >
                Create Bill
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 