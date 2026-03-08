-- Create SECURITY DEFINER function to check team membership (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Create SECURITY DEFINER function to check if user belongs to any team in org
CREATE OR REPLACE FUNCTION public.user_team_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM team_members WHERE user_id = _user_id
$$;

-- Fix teams policies to use SECURITY DEFINER function instead of subquery on team_members
DROP POLICY IF EXISTS "Managers can view own teams" ON public.teams;
DROP POLICY IF EXISTS "Members can view own teams" ON public.teams;

CREATE POLICY "Managers can view own teams" ON public.teams FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) AND organization_id = user_org_id(auth.uid()) AND is_team_member(auth.uid(), id));

CREATE POLICY "Members can view own teams" ON public.teams FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND NOT has_role(auth.uid(), 'manager'::app_role)
  AND organization_id = user_org_id(auth.uid()) AND is_team_member(auth.uid(), id));

-- Fix team_members policies to not reference teams table directly
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Admins can view org team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view own team members" ON public.team_members;

CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view org team members" ON public.team_members FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own team members" ON public.team_members FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND is_team_member(auth.uid(), team_id));