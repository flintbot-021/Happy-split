'use client';

import { useEffect, useState } from 'react';
import { testConnection, testInsert } from '@/lib/supabase/test';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ConnectionStatus } from './connection-status';
import { BillDisplay } from './bill-display';
import type { Bill } from '@/lib/supabase/models/bill';

export function SupabaseTest() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastInsertedBill, setLastInsertedBill] = useState<Bill | null>(null);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const result = await testConnection();
      
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
      const result = await testInsert();
      
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
    handleTestConnection();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 p-4">
      <ConnectionStatus status={isConnected} />
      
      <div className="space-y-2">
        <Button 
          onClick={handleTestConnection} 
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

      {lastInsertedBill && <BillDisplay bill={lastInsertedBill} />}
    </div>
  );
}