'use client';

import { useCamera } from '@/lib/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function CameraCapture({ onCapture, onCancel, isProcessing }: CameraCaptureProps) {
  const { videoRef, isActive, startCamera, stopCamera, captureImage } = useCamera();

  const handleCapture = async () => {
    try {
      const base64Image = await captureImage();
      stopCamera();
      onCapture(base64Image);
    } catch (error) {
      console.error('Failed to capture image:', error);
    }
  };

  if (!isActive) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed border-gray-600 rounded-lg">
        <Camera className="w-12 h-12 text-gray-400" />
        <p className="text-gray-400 text-center">
          Take a photo of your receipt
        </p>
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={startCamera}
            disabled={isProcessing}
          >
            Start Camera
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
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full aspect-[3/4] bg-black rounded-lg"
      />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          disabled={isProcessing}
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          size="lg"
          onClick={handleCapture}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Capture Receipt'}
        </Button>
      </div>
    </div>
  );
}