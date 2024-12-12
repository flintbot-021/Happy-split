import { Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import type { Bill } from '@/types/database';

interface BillHeaderProps {
  bill: Bill;
}

export function BillHeader({ bill }: BillHeaderProps) {
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(bill.otp);
    toast({
      title: 'Code Copied!',
      description: 'Share this code with others to join the bill.',
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Split Bill</h1>
        <p className="text-sm text-gray-400">
          {bill.participants.length} participant{bill.participants.length !== 1 ? 's' : ''}
        </p>
      </div>
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleShare}
      >
        <Share className="w-4 h-4" />
        Share Code: {bill.otp}
      </Button>
    </div>
  );
}