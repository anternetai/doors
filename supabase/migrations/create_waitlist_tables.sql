-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  position integer NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_by text,
  created_at timestamptz DEFAULT now()
);

-- Beta applications table
CREATE TABLE IF NOT EXISTS beta_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  industry text NOT NULL,
  doors_per_week integer,
  reason text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS waitlist_position_idx ON waitlist (position);
CREATE INDEX IF NOT EXISTS waitlist_referral_code_idx ON waitlist (referral_code);
CREATE INDEX IF NOT EXISTS beta_applications_status_idx ON beta_applications (status);
