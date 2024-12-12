"use client";

import { useRef, useState } from 'react';
import { Camera, FlipHorizontal, Camera as CameraIcon, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (image: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📸 File selected:', { 
      name: file?.name,
      type: file?.type,
      size: file?.size 
    });

    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        console.warn('❌ File too large:', file.size);
        alert('Image size must be less than 4MB');
        return;
      }

      try {
        console.log('📸 Starting file processing');
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            console.log('📸 File read complete, length:', result.length);
            const base64 = result.split(',')[1];
            resolve(`data:${file.type};base64,${base64}`);
          };
          reader.onerror = (error) => {
            console.error('❌ File read error:', error);
            reject(error);
          };
          reader.readAsDataURL(file);
        });

        console.log('📸 Calling onCapture with base64 string length:', base64String.length);
        onCapture(base64String);
      } catch (error) {
        console.error('❌ Error processing file:', error);
        alert('Failed to process image');
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsActive(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current) {
      console.warn('❌ Video ref not available');
      return;
    }

    try {
      console.log('📸 Starting image capture');
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      console.log('📸 Canvas dimensions:', { 
        width: canvas.width, 
        height: canvas.height 
      });
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('📸 Image captured, data URL length:', imageData.length);
        onCapture(imageData);
        stopCamera();
      }
    } catch (error) {
      console.error('❌ Error capturing image:', error);
      alert('Failed to capture image');
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => {
      const next = prev === 'user' ? 'environment' : 'user';
      if (stream) {
        stopCamera();
        setTimeout(() => {
          setFacingMode(next);
          startCamera();
        }, 100);
      }
      return next;
    });
  };

  return (
    <div className="relative w-full max-w-md mx-auto space-y-4">
      {!isActive ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={startCamera}
            className="w-full p-4 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <CameraIcon size={24} />
            Start Camera
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Upload size={24} />
              Upload Image
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={toggleCamera}
              className="p-3 bg-gray-800/80 text-white rounded-full"
            >
              <FlipHorizontal size={24} />
            </button>
            <button
              onClick={captureImage}
              className="p-3 bg-blue-600/80 text-white rounded-full"
            >
              <Camera size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 