"use client";

import { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, UtensilsCrossed, Wine, Scissors } from 'lucide-react';
import { ExtractedItem, Category, CATEGORY_ORDER } from '../types';
import { SplitItemDialog } from '@/components/split-item-dialog';

interface PreviewStepProps {
  items: ExtractedItem[];
  onUpdateItems: (items: ExtractedItem[]) => void;
}

export function PreviewStep({ items, onUpdateItems }: PreviewStepProps) {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [splittingItem, setSplittingItem] = useState<ExtractedItem | null>(null);
  const [splitCount, setSplitCount] = useState(2);
  const editFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editFormRef.current && !editFormRef.current.contains(event.target as Node)) {
        setEditingItem(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const startEditing = (item: ExtractedItem, index: number) => {
    setEditingItem(index);
  };

  const handleEditChange = (index: number, updates: Partial<ExtractedItem>) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    );
    onUpdateItems(updatedItems);
  };

  const handleDeleteItem = (index: number) => {
    onUpdateItems(items.filter((_, i) => i !== index));
  };

  const startSplitting = (item: ExtractedItem) => {
    setSplittingItem(item);
    setSplitCount(2);
  };

  const handleSplitConfirm = () => {
    if (!splittingItem) return;

    const index = items.indexOf(splittingItem);
    if (index === -1) return;

    const totalPrice = splittingItem.price * splittingItem.quantity;
    const pricePerPortion = Number((totalPrice / splitCount).toFixed(2));
    
    // Create split items
    const splitItems = Array.from({ length: splitCount }, (_, i) => ({
      ...splittingItem,
      name: `${splittingItem.name} (Part ${i + 1})`,
      price: pricePerPortion,
      quantity: 1,
    }));

    // Replace original item with split items
    const newItems = [
      ...items.slice(0, index),
      ...splitItems,
      ...items.slice(index + 1)
    ];

    onUpdateItems(newItems);
    setSplittingItem(null);
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Food';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<Category, ExtractedItem[]>);

  const renderEditForm = (item: ExtractedItem, index: number) => {
    return (
      <div ref={editFormRef} className="flex-1 space-y-2">
        <input
          type="text"
          value={item.name}
          onChange={e => handleEditChange(index, { name: e.target.value })}
          className="w-full p-1 border rounded"
          autoFocus
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={item.quantity}
            onChange={e => handleEditChange(index, { quantity: Number(e.target.value) })}
            className="w-20 p-1 border rounded"
            min="1"
          />
          <input
            type="number"
            value={item.price}
            onChange={e => handleEditChange(index, { price: Number(e.target.value) })}
            className="w-24 p-1 border rounded"
            step="0.01"
            min="0"
          />
          <select
            value={item.category}
            onChange={e => handleEditChange(index, { category: e.target.value as Category })}
            className="p-1 border rounded"
          >
            <option value="Food">Food</option>
            <option value="Drinks">Drinks</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>
      </div>
    );
  };

  // Safety check for items
  if (!Array.isArray(items)) {
    return (
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Confirm Items</h2>
        <p className="text-muted-foreground">No items to display</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Confirm Items</h2>
      
      <div className="space-y-6">
        {CATEGORY_ORDER.map(category => {
          if (!groupedItems[category]?.length) return null;
          
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                {category === 'Drinks' ? (
                  <Wine className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                )}
                <h3 className="font-semibold">{category}</h3>
              </div>
              <ul className="space-y-3">
                {groupedItems[category].map((item, index) => (
                  <li 
                    key={`${category}-${index}`}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                  >
                    {editingItem === items.indexOf(item) ? (
                      renderEditForm(item, items.indexOf(item))
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
                            onClick={() => startSplitting(item)}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <Scissors size={16} />
                          </button>
                          <button
                            onClick={() => startEditing(item, items.indexOf(item))}
                            className="p-1 text-gray-600 hover:text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(items.indexOf(item))}
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
          );
        })}
      </div>

      <SplitItemDialog
        item={splittingItem}
        splitCount={splitCount}
        onSplitCountChange={setSplitCount}
        onConfirm={handleSplitConfirm}
        onClose={() => setSplittingItem(null)}
      />
    </Card>
  );
} 