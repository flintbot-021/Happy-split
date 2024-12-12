'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinBill() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      router.push(`/bills/${code}`);
    }
  };

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Join Bill</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Bill Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full p-4 text-center text-2xl font-mono tracking-wider border rounded-lg"
            />
          </div>
          
          <button
            type="submit"
            disabled={code.length !== 6}
            className="w-full p-4 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            Join Bill
          </button>
        </form>
      </div>
    </main>
  );
} 