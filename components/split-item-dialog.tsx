import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ExtractedItem } from "@/app/create/types";

interface SplitItemDialogProps {
  item: ExtractedItem | null;
  splitCount: number;
  onSplitCountChange: (count: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function SplitItemDialog({ 
  item, 
  splitCount, 
  onSplitCountChange, 
  onConfirm, 
  onClose 
}: SplitItemDialogProps) {
  if (!item) return null;

  const totalPrice = item.price * item.quantity;
  const pricePerPortion = Number((totalPrice / splitCount).toFixed(2));

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Split Item</DialogTitle>
          <DialogDescription>
            Split "{item.name}" into equal portions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Number of portions</span>
              <span className="font-medium">{splitCount}</span>
            </div>
            <Slider
              value={[splitCount]}
              min={2}
              max={10}
              step={1}
              onValueChange={([value]) => onSplitCountChange(value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original price</span>
              <span>R{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per portion</span>
              <span className="font-medium text-green-600">
                R{pricePerPortion.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            onClick={onConfirm}
            className="w-full"
          >
            Split into {splitCount} portions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 