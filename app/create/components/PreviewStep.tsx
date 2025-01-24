"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Edit2, Trash2, UtensilsCrossed, Wine, Check, X } from 'lucide-react';
import { ExtractedItem, Category } from '../types';

interface PreviewStepProps {
  items: ExtractedItem[];
  onUpdateItems: (items: ExtractedItem[]) => void;
}

export function PreviewStep({ items, onUpdateItems }: PreviewStepProps) {
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ExtractedItem | null>(null);

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
      onUpdateItems(
        items.map((item, i) => i === index ? editForm : item)
      );
      setEditingItem(null);
      setEditForm(null);
    }
  };

  const handleDeleteItem = (index: number) => {
    onUpdateItems(items.filter((_, i) => i !== index));
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Food';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<Category, ExtractedItem[]>);

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
    <Card className="p-4">
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
        )}
      </div>
    </Card>
  );
} 