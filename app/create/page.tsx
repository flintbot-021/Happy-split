"use client";

import { useState } from 'react';
import { CameraCapture } from '@/components/camera-capture';
import { Edit2, Trash2, ClipboardCopy } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ProcessingStatus = 'idle' | 'processing' | 'done' | 'error';

interface ExtractedItem {
  name: string;
  price: number;
  quantity: number;
  category?: 'Drinks' | 'Food' | 'Desserts';
}

export default function CreateBill() {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setStatus('processing');
    
    try {
      const response = await fetch('/api/process-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!response.ok) throw new Error('Failed to process image');

      const data = await response.json();
      setExtractedItems(data.items);
      setStatus('done');
    } catch (error) {
      console.error('Error processing image:', error);
      setStatus('error');
    }
  };

  const handleUpdateItem = (index: number, updates: Partial<ExtractedItem>) => {
    setExtractedItems(items => 
      items.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (index: number) => {
    setExtractedItems(items => items.filter((_, i) => i !== index));
  };

  const totalAmount = extractedItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('items', JSON.stringify(extractedItems))
      formData.append('totalAmount', totalAmount.toString())

      const response = await fetch('/api/bills', {
        method: 'POST',
        body: formData,
      });

      const { billId } = await response.json();
      router.push(`/bills/${billId}`);
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  const ShareDialog = () => {
    if (!shareCode) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">Share Bill</h2>
          <p className="text-gray-600 mb-4">
            Share this code with others to split the bill:
          </p>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg text-3xl font-mono tracking-wider text-center flex-1">
              {shareCode.match(/.{1,3}/g)?.join(' ')}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareCode);
                alert('Code copied!');
              }}
              className="p-2 text-blue-600 hover:text-blue-800"
            >
              <ClipboardCopy size={20} />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShareCode(null);
                router.push(`/bills/${shareCode}`);
              }}
              className="flex-1 p-3 bg-blue-600 text-white rounded-lg"
            >
              Continue to Bill
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Bill</h1>
        
        {status === 'idle' && !capturedImage && (
          <CameraCapture onCapture={handleCapture} />
        )}

        {status === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your bill...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to process the image</p>
            <button
              onClick={() => {
                setCapturedImage(null);
                setStatus('idle');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'done' && extractedItems.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Extracted Items</h2>
              <ul className="space-y-3">
                {extractedItems.map((item, index) => (
                  <li 
                    key={index} 
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    {editingItem === index ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleUpdateItem(index, { name: e.target.value })}
                          className="w-full p-1 border rounded"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={e => handleUpdateItem(index, { quantity: Number(e.target.value) })}
                            className="w-20 p-1 border rounded"
                          />
                          <input
                            type="number"
                            value={item.price}
                            onChange={e => handleUpdateItem(index, { price: Number(e.target.value) })}
                            className="w-24 p-1 border rounded"
                            step="0.01"
                          />
                          <select
                            value={item.category}
                            onChange={e => handleUpdateItem(index, { category: e.target.value as ExtractedItem['category'] })}
                            className="p-1 border rounded"
                          >
                            <option value="Food">Food</option>
                            <option value="Drinks">Drinks</option>
                            <option value="Desserts">Desserts</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}x · R{item.price.toFixed(2)} · {item.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(index)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(index)}
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
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setStatus('idle');
                }}
                className="flex-1 p-3 bg-gray-600 text-white rounded-lg"
              >
                Retake Photo
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg"
              >
                Save Bill
              </button>
            </div>
          </div>
        )}
      </div>
      {shareCode && <ShareDialog />}
    </main>
  );
} 