'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Failed to load bill
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The bill could not be found or there was an error loading it.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
} 