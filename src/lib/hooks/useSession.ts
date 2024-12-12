import { useState, useEffect } from 'react';

export interface Session {
  id: string;
  name: string;
  billId?: string;
}

const SESSION_KEY = 'happysplit_session';

export function useSession() {
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const createSession = (name: string, billId?: string) => {
    setSession({
      id: crypto.randomUUID(),
      name,
      billId,
    });
  };

  const updateSession = (updates: Partial<Session>) => {
    setSession(prev => prev ? { ...prev, ...updates } : null);
  };

  const clearSession = () => setSession(null);

  return {
    session,
    createSession,
    updateSession,
    clearSession,
  };
}