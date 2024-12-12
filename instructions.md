# HappySplit Development Guide

## 1. Technical Stack

### Core Technologies
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Supabase
- OpenAI Vision API
- Lucide Icons

### Optional Integrations
- Resend (for email services, if needed)
- Vercel V0

## 2. Project Structure

### Components
- All components go in `/components` directory (root level)
- Use kebab-case for component files: `example-component.ts`
- Client components must include `"use client"` directive

### Pages
- All pages go in `/app` directory
- Follow Next.js 15 App Router conventions
- API routes belong in `/app/api`

## 3. Core Features

### Create Bill Flow
1. Home screen "Create Bill" selection
2. Camera activation for bill photo
3. OpenAI OCR processing
4. Item categorization (Drinks, Food, Desserts)
5. Editable UI for line items
6. Primary user controls for adjustments

### Join Bill Flow
1. 4-character OTP entry
2. Real-time bill view
3. Item selection with quantity adjustment
4. Dynamic updates via Supabase Realtime
5. Grayed-out claimed items

### Bill Management
1. Real-time collaboration
2. Tip adjustment (0-50%)
3. Primary user privileges
4. 30-minute expiration
5. Total calculations

## 4. Development Guidelines

### Data Management
- Server components handle data fetching
- Pass data down as props
- Use Supabase Realtime for live updates
- Implement temporary storage with auto-expiration

### Code Organization
- Keep codebase lean and modular
- Clear separation of concerns
- Document significant changes
- Test thoroughly before adding complexity

### UI/UX Requirements
- Mobile-first design
- Touch-optimized interactions
- Real-time update indicators
- Toggle views for bill and subtotals
- Responsive layout

## 5. Performance Requirements
- Initial load: < 2 seconds
- OCR processing: < 5 seconds
- Real-time updates: < 500ms
- Support concurrent sessions
- Handle peak usage efficiently

## 6. Development Process

### Documentation
1. Always reference and update `@instructions.md`
2. Document changes for:
   - API implementations
   - Supabase schema updates
   - UI component additions
   - Core functionality changes

### Task Approach
1. Break down into manageable steps
2. Start with basic implementation
3. Test thoroughly
4. Iterate and enhance
5. Document changes

### Deployment
- Local development first
- Deploy to Vercel
- Monitor performance metrics

## 7. MVP Limitations
- Single currency (ZAR)
- No user accounts
- No offline functionality
- No bill export
- No multi-currency support

## 8. Database Schema (Supabase)

Database Schema Documentation - HappySplit
Database Overview
HappySplit uses Supabase as its primary database, implementing a relational schema to manage bills, items, participants, and item assignments. The schema is designed to support real-time collaboration while maintaining data integrity and security.
Table Structures
1. Bills Table
Primary table for storing bill information
sqlCopyCREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
    otp VARCHAR(4) NOT NULL,
    status VARCHAR(10) DEFAULT 'active',
    total_amount DECIMAL(10,2),
    active_users INTEGER DEFAULT 1,
    creator_name VARCHAR(50) NOT NULL
);

Handles bill creation and expiration
Manages OTP for bill access
Tracks total amount and active users
Stores temporary session data

2. Bill Items Table
Stores individual items from scanned bills
sqlCopyCREATE TABLE bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Links items to specific bills
Categorizes items (Drinks, Food, Desserts)
Manages item quantities and prices

3. Participants Table
Manages temporary user sessions for bill splitting
sqlCopyCREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    tip_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Tracks participant information
Manages individual tip percentages
Links participants to specific bills

4. Item Assignments Table
Handles the relationship between items and participants
sqlCopyCREATE TABLE item_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_item_id UUID REFERENCES bill_items(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    quantity DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

Manages item claiming
Supports partial quantity assignments
Enables real-time updates

Security Features
Row Level Security (RLS)

Enabled on all tables
Policies restrict access to active bills only
No authentication required (per MVP requirements)

Data Privacy

Automatic deletion after 30 minutes
No permanent storage of personal information
Session-based access control via OTP

Real-time Features
Supabase Realtime

Enabled for all tables
Supports instant updates for:

Item assignments
Participant changes
Bill status updates
Total calculations



Automatic Cleanup

Bills expire after 30 minutes
Cascading deletes ensure data cleanup
Trigger-based expiration handling

Performance Optimizations

Indexed OTP field for quick lookups
Optimized relationship queries
Efficient real-time subscription handling

Integration Points

OCR data storage
Real-time collaboration
Bill expiration management
Item assignment tracking

## 9. Security Requirements
- No personal data storage
- Session-based authentication
- OTP access control
- Automatic data cleanup
- Secure real-time connections