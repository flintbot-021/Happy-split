import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import type { Bill, Participant } from '@/types/database';

export function useParticipants(bill: Bill) {
  const [participants, setParticipants] = useState<Participant[]>(bill.participants);

  useEffect(() => {
    setParticipants(bill.participants);
  }, [bill.participants]);

  const updateParticipant = async (participantId: string, updates: Partial<Participant>) => {
    const updatedParticipants = participants.map(p =>
      p.id === participantId ? { ...p, ...updates } : p
    );

    const { error } = await supabase
      .from('bills')
      .update({ participants: updatedParticipants })
      .eq('id', bill.id);

    if (error) throw new Error('Failed to update participant');
  };

  return { participants, updateParticipant };
}