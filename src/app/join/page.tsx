import { JoinBillForm } from '@/components/join-bill/join-bill-form';

export default function JoinBillPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-bold mb-6">Join Existing Bill</h1>
        <JoinBillForm />
      </div>
    </main>
  );
}