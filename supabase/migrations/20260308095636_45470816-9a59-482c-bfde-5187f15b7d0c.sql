
-- Helper: check if a user is in the same team as another user
CREATE OR REPLACE FUNCTION public.shares_team_with(_viewer_id uuid, _target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_members tm1
    JOIN team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = _viewer_id
      AND tm2.user_id = _target_id
  )
$$;

-- Managers can view profiles of users in their team(s)
CREATE POLICY "Managers can view team profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role)
  AND organization_id = user_org_id(auth.uid())
  AND shares_team_with(auth.uid(), id)
);

-- Create service_requests table for DB-backed requests
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  requester_id uuid NOT NULL,
  request_type text NOT NULL DEFAULT 'coaching_session',
  module_title text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Admins can manage all org service requests
CREATE POLICY "Admins can manage org service requests"
ON public.service_requests
FOR ALL
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Users can insert their own service requests
CREATE POLICY "Users can insert own service requests"
ON public.service_requests
FOR INSERT
WITH CHECK (requester_id = auth.uid() AND organization_id = user_org_id(auth.uid()));

-- Users can view their own service requests
CREATE POLICY "Users can view own service requests"
ON public.service_requests
FOR SELECT
USING (requester_id = auth.uid());
