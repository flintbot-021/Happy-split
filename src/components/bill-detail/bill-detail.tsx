import { useBillRealtime } from '@/lib/hooks/useBillRealtime';
import { BillHeader } from './bill-header';
import { BillItems } from './bill-items';
import { BillSummary } from './bill-summary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface BillDetailProps {
  billId: string;
}

export function BillDetail({ billId }: BillDetailProps) {
  const { bill, loading, error } = useBillRealtime(billId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !bill) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Failed to load bill details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BillHeader bill={bill} />
      <BillItems bill={bill} />
      <BillSummary bill={bill} />
    </div>
  );
}