'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { CameraCapture } from './camera-capture';
import { UploadReceipt } from './upload-receipt';

interface ReceiptInputProps {
  onCapture: (base64Image: string) => void;
  isProcessing: boolean;
}

export function ReceiptInput({ onCapture, isProcessing }: ReceiptInputProps) {
  const [mode, setMode] = useState<'idle' | 'camera' | 'upload'>('idle');

  return (
    <div className="space-y-4">
      {mode === 'idle' ? (
        <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-600 rounded-lg">
          <div className="flex gap-4">
            <Button
              size="lg"
              onClick={() => setMode('camera')}
              disabled={isProcessing}
              className="gap-2"
            >
              <Camera className="w-5 h-5" />
              Take Photo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setMode('upload')}
              disabled={isProcessing}
              className="gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Receipt
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {mode === 'camera' ? (
            <CameraCapture
              onCapture={onCapture}
              isProcessing={isProcessing}
              onCancel={() => setMode('idle')}
            />
          ) : (
            <UploadReceipt
              onUpload={onCapture}
              isProcessing={isProcessing}
              onCancel={() => setMode('idle')}
            />
          )}
        </div>
      )}
    </div>
  );
}