import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SupabaseTest } from '@/components/supabase-test';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">HappySplit</h1>
          <p className="text-xl mb-8">Split your restaurant bill effortlessly</p>
          
          <div className="space-y-4">
            <Link href="/create">
              <Button className="w-full max-w-sm" size="lg">
                Create New Bill
              </Button>
            </Link>
            
            <Link href="/join">
              <Button 
                className="w-full max-w-sm" 
                variant="outline" 
                size="lg"
              >
                Join Existing Bill
              </Button>
            </Link>

            <div className="mt-8 max-w-sm mx-auto">
              <SupabaseTest />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}