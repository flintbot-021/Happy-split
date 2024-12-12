export function logTestOperation(operation: string, data: unknown): void {
  console.log(`[Test ${operation}]:`, JSON.stringify(data, null, 2));
}

export function logTestError(operation: string, error: unknown): void {
  console.error(`[Test ${operation} Error]:`, error);
  
  if (error instanceof Error) {
    console.error(`[Test ${operation} Stack]:`, error.stack);
  }
}