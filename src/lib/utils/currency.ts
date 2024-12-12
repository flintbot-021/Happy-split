export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrency(value: string): number {
  return Number(value.replace(/[^0-9.-]+/g, ''));
}