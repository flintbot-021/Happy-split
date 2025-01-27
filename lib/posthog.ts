import posthog from 'posthog-js'

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init('phc_gMKJPE2B1CbBpbilaxjqQcWcTxVusN10rdpBpeSV9pS', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only'
  })
}

// Event Types
export interface BillCreatedEvent {
  totalAmount: number
  itemCount: number
  creatorName: string
}

export interface BillJoinedEvent {
  billId: string
  participantName: string
}

export interface ItemAssignedEvent {
  billId: string
  itemName: string
  itemPrice: number
  assignedTo: string
  quantity: number
}

export interface TipAdjustedEvent {
  billId: string
  previousPercentage: number
  newPercentage: number
  adjustedBy: string
}

export interface BillCompletedEvent {
  billId: string
  totalAmount: number
  tipPercentage: number
  participantCount: number
  duration: number
}

export interface QuantityAdjustedEvent {
  billId: string
  itemName: string
  previousQuantity: number
  newQuantity: number
  adjustedBy: string
}

export interface SelectionLockedEvent {
  billId: string
  participantName: string
  itemCount: number
  totalAmount: number
  tipAmount: number
}

export interface SummaryViewedEvent {
  billId: string
  outstandingAmount: number
  participantCount: number
  isComplete: boolean
}

export interface SelectionDeletedEvent {
  billId: string
  participantName: string
  itemCount: number
  totalAmount: number
}

interface BillEditedEvent {
  billId: string;
  totalAmount: number;
  itemCount: number;
}

// Analytics Functions
export const analytics = {
  billCreated: (data: BillCreatedEvent) => {
    posthog.capture('bill.created', data)
  },

  billJoined: (data: BillJoinedEvent) => {
    posthog.capture('bill.joined', data)
  },

  itemAssigned: (data: ItemAssignedEvent) => {
    posthog.capture('item.assigned', data)
  },

  tipAdjusted: (data: TipAdjustedEvent) => {
    posthog.capture('tip.adjusted', data)
  },

  billCompleted: (data: BillCompletedEvent) => {
    posthog.capture('bill.completed', data)
  },

  quantityAdjusted: (data: QuantityAdjustedEvent) => {
    posthog.capture('quantity.adjusted', data)
  },

  selectionLocked: (data: SelectionLockedEvent) => {
    posthog.capture('selection.locked', data)
  },

  summaryViewed: (data: SummaryViewedEvent) => {
    posthog.capture('summary.viewed', data)
  },

  selectionDeleted: (data: SelectionDeletedEvent) => {
    posthog.capture('selection.deleted', data)
  },

  billEdited: (data: BillEditedEvent) => {
    posthog.capture('bill.edited', data)
  }
} 