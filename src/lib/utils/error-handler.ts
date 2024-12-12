type ErrorContext = {
  message: string;
  details?: unknown;
  code?: string;
};

export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

export function logError(context: string, error: unknown): void {
  console.error(`[${context}] Error:`, error);
  
  if (error instanceof Error) {
    console.error(`[${context}] Stack:`, error.stack);
  }

  // Log additional context if available
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as ErrorContext;
    if (errorObj.message) {
      console.error(`[${context}] Message:`, errorObj.message);
    }
    if (errorObj.details) {
      console.error(`[${context}] Details:`, errorObj.details);
    }
    if (errorObj.code) {
      console.error(`[${context}] Code:`, errorObj.code);
    }
  }
}