import { createContext, useContext } from 'react';
import { useSession, type Session } from '@/lib/hooks/useSession';

interface SessionContextType {
  session: Session | null;
  createSession: (name: string, billId?: string) => void;
  updateSession: (updates: Partial<Session>) => void;
  clearSession: () => void;
}

export const SessionContext = createContext<SessionContextType>({
  session: null,
  createSession: () => {},
  updateSession: () => {},
  clearSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionData = useSession();

  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  return useContext(SessionContext);
}