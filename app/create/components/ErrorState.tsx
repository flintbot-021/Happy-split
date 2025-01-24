"use client";

import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

export function ErrorState() {
  const router = useRouter();

  return (
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
  );
} 