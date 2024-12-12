export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}