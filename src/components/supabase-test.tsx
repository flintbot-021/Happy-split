'use client';

import { useEffect, useState } from 'react';
import { testSupabaseConnection, testInsertBill } from '@/lib/supabase/test';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { LoadingSpinner } from './ui/loading-spinner';
import type { Bill } from '@/lib/supabase/models/bill';

export function SupabaseTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastInsertedBill, setLastInsertedBill] = useState<Bill | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testSupabaseConnection();
      
      setIsConnected(result.success);
      toast({
        title: result.success ? 'Connection Successful' : 'Connection Failed',
        description: result.success 
          ? 'Successfully connected to Supabase!'
          : result.error,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setIsConnected(false);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to Supabase',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestInsert = async () => {
    setIsLoading(true);
    try {
      const result = await testInsertBill();
      
      if (result.success && result.data) {
        setLastInsertedBill(result.data);
        toast({
          title: 'Insert Successful',
          description: `Created test bill with ID: ${result.data.id}`,
        });
      } else {
        toast({
          title: 'Insert Failed',
          description: result.error || 'Failed to insert test bill',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Insert Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isConnected === null ? 'bg-gray-400' :
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>
          {isConnected === null ? 'Checking connection...' :
           isConnected ? 'Connected to Supabase' : 'Connection failed'}
        </span>
      </div>
      
      <div className="space-y-2">
        <Button 
          onClick={testConnection} 
          className="w-full"
          disabled={isLoading}
        >
          Test Connection
        </Button>
        
        <Button 
          onClick={handleTestInsert} 
          variant="outline"
          className="w-full"
          disabled={!isConnected || isLoading}
        >
          Test Insert
        </Button>
      </div>

      {lastInsertedBill && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-2">
          <h3 className="font-semibold">Last Inserted Bill</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(lastInsertedBill, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}