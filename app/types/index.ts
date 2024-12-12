export interface Diner {
  id: string
  name: string
  items: {
    itemId: string
    quantity: number
  }[]
  tipAmount: number
  total: number
} 