'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface UploadReceiptProps {
  onUpload: (base64Image: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function UploadReceipt({ onUpload, onCancel, isProcessing }: UploadReceiptProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Image = await readFileAsBase64(file);
      onUpload(base64Image);
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-600 rounded-lg">
        <Upload className="w-12 h-12 text-gray-400" />
        <p className="text-gray-400 text-center">
          Click to select a receipt image or drag and drop
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={() => inputRef.current?.click()}
            disabled={isProcessing}
          >
            Select Image
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}