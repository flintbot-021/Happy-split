import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BillProcessingProps {
  mode: "create" | "join";
}

export function BillProcessing({ mode }: BillProcessingProps) {
  const steps = [
    { 
      label: mode === "create" ? "Reading receipt..." : "Reading bill items...", 
      color: "bg-green-500", 
      done: true 
    },
    { 
      label: "Calculating prices...", 
      color: "bg-green-500", 
      done: true 
    },
    { 
      label: "Preparing preview...", 
      color: "bg-blue-500", 
      done: false 
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="relative">
          <CardContent className="pt-8 pb-8">
            {/* Loading Spinner and Text */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Processing your {mode === "create" ? "receipt" : "bill"}...</span>
            </div>

            {/* Processing Steps */}
            <div className="flex flex-col items-center gap-2 mb-8">
              {steps.map((step) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    step.done ? "bg-green-500" : "bg-blue-500 animate-pulse"
                  )} />
                  <span className={cn(
                    "text-sm",
                    step.done ? "text-green-500" : "text-blue-500"
                  )}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Background Skeleton UI */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 