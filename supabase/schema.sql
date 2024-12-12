-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create bills table
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    otp TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
    creator_id UUID NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    items JSONB NOT NULL DEFAULT '[]'::JSONB,
    participants JSONB NOT NULL DEFAULT '[]'::JSONB
);

-- Create index for OTP lookups
CREATE UNIQUE INDEX bills_otp_idx ON bills(otp) WHERE status = 'active';

-- Enable Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read active bills
CREATE POLICY "Anyone can read active bills"
    ON bills FOR SELECT
    USING (status = 'active');

-- Create policy to allow anyone to create bills
CREATE POLICY "Anyone can create bills"
    ON bills FOR INSERT
    WITH CHECK (true);

-- Create policy to allow anyone to update active bills
CREATE POLICY "Anyone can update active bills"
    ON bills FOR UPDATE
    USING (status = 'active')
    WITH CHECK (status = 'active');

-- Enable realtime for bills table
ALTER PUBLICATION supabase_realtime ADD TABLE bills;