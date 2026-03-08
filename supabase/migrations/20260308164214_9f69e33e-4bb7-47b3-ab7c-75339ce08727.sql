
CREATE TABLE public.demo_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  demo_environment TEXT NOT NULL DEFAULT 'Horizon Group',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- No RLS needed - accessed only via edge functions with service role key
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;
