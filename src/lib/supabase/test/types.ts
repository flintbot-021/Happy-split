export interface TestResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}