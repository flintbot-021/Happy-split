"use client";

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Image size must be less than 4MB');
      return;
    }

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(`data:${file.type};base64,${base64}`);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      router.push('/create');
      // Store the image data in sessionStorage to be used in the create page
      sessionStorage.setItem('capturedImage', base64String);
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    }
  };

  const handleJoinBill = () => {
    if (otp.length === 4) {
      router.push(`/bills/${otp}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">HappySplit</h1>
          <p className="text-muted-foreground">Split bills effortlessly</p>
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="lg"
          className="w-full"
        >
          Create Bill
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or join a bill
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <InputOTP
            value={otp}
            onChange={(value: string) => setOtp(value)}
            maxLength={4}
            render={({ slots }: { slots: any[] }) => (
              <InputOTPGroup className="w-full grid grid-cols-4 gap-3">
                {slots.map((slot, index: number) => (
                  <InputOTPSlot
                    key={index}
                    {...slot}
                    className={cn(
                      "w-full aspect-square rounded-md border text-center text-3xl"
                    )}
                  />
                ))}
              </InputOTPGroup>
            )}
          />
          
          <Button
            onClick={handleJoinBill}
            variant="secondary"
            size="lg"
            className="w-full"
            disabled={otp.length !== 4}
          >
            Join Bill
          </Button>
        </div>
      </div>
    </main>
  );
} 