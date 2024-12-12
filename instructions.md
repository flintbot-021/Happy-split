# HappySplit Development Instructions

## Project Overview
HappySplit is a progressive web application designed to simplify restaurant bill splitting. The app uses AI-powered OCR for bill scanning, real-time collaboration features, and an intuitive mobile-first interface to help users accurately split their restaurant bills.

## Technical Stack
- Frontend: Next.js 15 with Tailwind CSS and shadcn/ui components
- Backend: Supabase (database, authentication, real-time features)
- AI Integration: OpenAI Vision API for OCR processing
- State Management: React Hooks + Context API

## Core Architecture

### Database Schema

#### Bills Table
```typescript
interface Bill {
  id: string;
  created_at: string;
  otp: string;
  status: 'active' | 'expired';
  creator_id: string;
  total_amount: number;
  items: BillItem[];
  participants: Participant[];
}
```

#### Bill Items Table
```typescript
interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: 'Drinks' | 'Food' | 'Desserts';
  assigned_to?: string;
}
```

#### Participants Table
```typescript
interface Participant {
  id: string;
  name: string;
  tip_percentage: number;
  subtotal: number;
}
```

## Key Features Implementation

### 1. Bill Creation Flow
- Implement camera activation for bill capture
- Integrate OpenAI Vision API for OCR processing
- Add item categorization logic (Drinks, Food, Desserts)
- Create editable UI elements for bill items
- Implement real-time updates using Supabase Realtime

### 2. Bill Joining Flow
- Generate and validate 4-character OTP
- Create session-based authentication
- Implement real-time item claiming system
- Add visual indicators for claimed items
- Create participant management system

### 3. Real-time Collaboration
- Set up Supabase Realtime subscriptions
- Implement item claiming logic
- Add real-time total calculations
- Create shared view for all participants
- Add active user indicators

### 4. Bill Management
- Implement tip adjustment system (0-50% range)
- Add item editing for primary user
- Create automatic bill expiration system
- Implement category management
- Add real-time total updates

## Performance Requirements
- Initial page load: < 2 seconds
- OCR processing: < 5 seconds
- Real-time updates: < 500ms
- Support for concurrent sessions
- Mobile-optimized performance

## Security Implementation
1. Session Management:
   - Implement OTP-based access
   - Add 30-minute session expiration
   - Create temporary storage system

2. Privacy Measures:
   - No personal data storage
   - Automatic data cleanup
   - Secure real-time connections

## Development Phases

### Phase 1 (MVP)
1. Basic Setup:
   - Configure Next.js project
   - Set up Supabase integration
   - Implement shadcn/ui components
   - Configure Tailwind CSS

2. Core Features:
   - Bill creation and scanning
   - Real-time collaboration
   - Basic bill management
   - Tip calculations

### Phase 2
- Item splitting functionality
- Enhanced OCR accuracy
- User experience improvements
- Performance optimizations

## Testing Requirements
1. Unit Tests:
   - OCR processing accuracy
   - Bill calculations
   - Real-time updates

2. Integration Tests:
   - Multi-user scenarios
   - Concurrent bill sessions
   - Real-time synchronization

3. Performance Tests:
   - Load testing for concurrent users
   - Response time monitoring
   - Real-time update latency

## MVP Limitations
- Single currency support (ZAR only)
- No user accounts or authentication
- No offline functionality
- No bill export features
- No payment processing

## Development Guidelines
1. Mobile-First Approach:
   - Optimize for touch interactions
   - Ensure responsive design
   - Test on various devices

2. Code Organization:
   - Follow Next.js file structure
   - Implement proper state management
   - Use TypeScript for type safety

3. Error Handling:
   - Implement OCR fallbacks
   - Add network error recovery
   - Create user-friendly error messages

## Success Metrics
- Bill creation time < 1 minute
- Join process time < 30 seconds
- OCR accuracy > 95%
- User satisfaction metrics
- System uptime > 99.9%


## File structure
.
├── instructions.md
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── src
│   ├── app
│   │   ├── bill
│   │   │   └── [id]
│   │   │       └── page.tsx
│   │   ├── create
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── join
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── bill-detail
│   │   │   ├── bill-detail.tsx
│   │   │   ├── bill-header.tsx
│   │   │   ├── bill-items.tsx
│   │   │   └── bill-summary.tsx
│   │   ├── create-bill
│   │   │   ├── camera-capture.tsx
│   │   │   ├── create-bill-form.tsx
│   │   │   ├── items-list.tsx
│   │   │   ├── receipt-input.tsx
│   │   │   └── upload-receipt.tsx
│   │   ├── join-bill
│   │   │   └── join-bill-form.tsx
│   │   ├── providers
│   │   │   └── session-provider.tsx
│   │   ├── supabase-test
│   │   │   ├── bill-display.tsx
│   │   │   ├── connection-status.tsx
│   │   │   └── index.tsx
│   │   ├── supabase-test.tsx
│   │   └── ui
│   │       ├── button.tsx
│   │       ├── index.ts
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── slider.tsx
│   │       ├── tabs.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── use-toast.ts
│   ├── hooks
│   │   ├── useBill.ts
│   │   └── useCamera.ts
│   ├── lib
│   │   ├── bill-service.ts
│   │   ├── hooks
│   │   │   ├── index.ts
│   │   │   ├── useBillRealtime.ts
│   │   │   ├── useCamera.ts
│   │   │   ├── useParticipants.ts
│   │   │   └── useSession.ts
│   │   ├── openai.ts
│   │   ├── realtime.ts
│   │   ├── services
│   │   │   ├── index.ts
│   │   │   ├── receipt-service
│   │   │   │   ├── index.ts
│   │   │   │   ├── mock-processor.ts
│   │   │   │   ├── supabase-processor.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── validators.ts
│   │   │   └── receipt-service.ts
│   │   ├── state
│   │   │   └── toast-store.ts
│   │   ├── supabase
│   │   │   ├── bills.ts
│   │   │   ├── client.ts
│   │   │   ├── config.ts
│   │   │   ├── index.ts
│   │   │   ├── models
│   │   │   │   ├── bill-item.ts
│   │   │   │   ├── bill.ts
│   │   │   │   ├── database.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── participant.ts
│   │   │   ├── realtime.ts
│   │   │   ├── test
│   │   │   │   ├── fixtures
│   │   │   │   │   └── bill.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── operations
│   │   │   │   │   ├── connection.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── insert.ts
│   │   │   │   ├── test-data.ts
│   │   │   │   ├── test-operations.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── utils
│   │   │   │       ├── logging.ts
│   │   │   │       └── validation.ts
│   │   │   ├── test.ts
│   │   │   ├── transformers
│   │   │   │   └── bill.ts
│   │   │   ├── types.ts
│   │   │   └── validators.ts
│   │   ├── supabase.ts
│   │   ├── utils
│   │   │   ├── cn.ts
│   │   │   ├── currency.ts
│   │   │   ├── error-handler.ts
│   │   │   ├── index.ts
│   │   │   └── otp.ts
│   │   └── utils.ts
│   ├── providers
│   │   └── session-provider.tsx
│   └── types
│       ├── bill.ts
│       └── database.ts
├── supabase
│   ├── functions
│   │   └── process-receipt
│   │       ├── config.ts
│   │       ├── index.ts
│   │       ├── openai.ts
│   │       ├── types.ts
│   │       └── validators.ts
│   └── schema.sql
├── tailwind.config.js
└── tsconfig.json