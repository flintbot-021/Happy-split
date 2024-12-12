import { supabase } from '../../utils/supabase';
import { notFound } from 'next/navigation';

export default async function BillPage({ params }: { params: { id: string } }) {
  const { data: bill } = await supabase
    .from('bills')
    .select(`
      *,
      bill_items (
        *
      )
    `)
    .eq('id', params.id)
    .single();

  if (!bill) {
    notFound();
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Bill Details</h1>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Created on</p>
            <p>{new Date(bill.created_at).toLocaleDateString()}</p>
          </div>

          <h2 className="text-lg font-semibold mb-4">Items</h2>
          <ul className="space-y-3">
            {bill.bill_items.map((item) => (
              <li 
                key={item.id}
                className="flex justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity}x · {item.category}
                  </p>
                </div>
                <p className="font-medium">R{item.price.toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R{bill.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 