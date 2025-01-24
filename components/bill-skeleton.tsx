import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

export function BillSkeleton() {
  return (
    <div className="max-w-md mx-auto">
      <Card className="relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80">
          <div className="flex items-center gap-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-sm font-medium">Processing your bill</p>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            We&apos;re processing your bill...
          </div>
        </div>

        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Categories */}
          {[1, 2, 3].map((category) => (
            <div key={category} className="space-y-4">
              {/* Category Title */}
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              
              {/* Items */}
              <div className="space-y-1">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item} 
                    className="p-2 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        {/* Checkbox placeholder */}
                        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                        
                        {/* Item name placeholder */}
                        <div className="flex-1 flex items-center gap-2">
                          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      
                      {/* Price placeholder */}
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Separator className="my-4" />

          {/* Total section placeholder */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 