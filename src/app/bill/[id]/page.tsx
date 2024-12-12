import { BillDetail } from '@/components/bill-detail/bill-detail';

interface BillPageProps {
  params: {
    id: string;
  };
}

export default function BillPage({ params }: BillPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="container mx-auto max-w-2xl">
        <BillDetail billId={params.id} />
      </div>
    </main>
  );
}