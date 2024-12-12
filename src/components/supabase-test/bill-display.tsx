import type { Bill } from '@/lib/supabase/models/bill';

interface BillDisplayProps {
  bill: Bill;
}

export function BillDisplay({ bill }: BillDisplayProps) {
  return (
    <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-2">
      <h3 className="font-semibold">Last Inserted Bill</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(bill, null, 2)}
      </pre>
    </div>
  );
}