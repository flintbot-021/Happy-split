"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Convert the file to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      // Store the image data in sessionStorage to be used in the create page
      sessionStorage.setItem('capturedImage', base64String);
      router.push('/create');
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    }
  };

  const handleComplete = (value: string) => {
    if (value.length === 4) {
      router.push(`/bills/${value}`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Happy Pay</h1>
          <p className="text-muted-foreground">
            Split your bill with friends, hassle-free
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-[#0F172A] hover:bg-[#0F172A]/90 text-white"
            size="lg"
          >
            Upload Bill
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                OR
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <InputOTP
              maxLength={4}
              value={otp}
              onChange={setOtp}
              onComplete={handleComplete}
            >
              <InputOTPGroup className="w-full grid grid-cols-4 gap-0">
                <InputOTPSlot index={0} className="w-full h-[60px] text-2xl" />
                <InputOTPSlot index={1} className="w-full h-[60px] text-2xl" />
                <InputOTPSlot index={2} className="w-full h-[60px] text-2xl" />
                <InputOTPSlot index={3} className="w-full h-[60px] text-2xl" />
              </InputOTPGroup>
            </InputOTP>
            <p className="text-xs text-center text-muted-foreground">
              Enter a code to join a bill
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 