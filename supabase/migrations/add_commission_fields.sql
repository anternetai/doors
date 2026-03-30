ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_structure jsonb DEFAULT '{"type": "flat", "rate": 0}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS commission_currency text DEFAULT 'USD';
