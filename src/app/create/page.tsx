import { CreateBillForm } from '@/components/create-bill/create-bill-form';

export default function CreateBillPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create New Bill</h1>
        <CreateBillForm />
      </div>
    </main>
  );
}