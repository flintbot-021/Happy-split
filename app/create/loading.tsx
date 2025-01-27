import { BillProcessing } from "@/app/components/bill-processing";

export default function Loading() {
  return (
    <main className="min-h-screen p-4">
      <BillProcessing mode="create" />
    </main>
  );
} 