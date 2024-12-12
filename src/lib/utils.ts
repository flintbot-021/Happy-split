import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateOTP = (): string => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

export const calculateSubtotal = (items: any[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const calculateTip = (subtotal: number, tipPercentage: number): number => {
  return subtotal * (tipPercentage / 100);
};