-- The restrictive ALL policy on teams causes conflicts. Replace with permissive.
DROP POLICY IF EXISTS "Admins can manage org teams" ON public.teams;

CREATE POLICY "Admins can manage org teams" ON public.teams FOR ALL TO authenticated
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Same fix for team_members ALL policy
DROP POLICY IF EXISTS "Admins can manage team members" ON public.team_members;

CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM teams t WHERE t.id = team_members.team_id AND t.organization_id = user_org_id(auth.uid())
))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM teams t WHERE t.id = team_members.team_id AND t.organization_id = user_org_id(auth.uid())
));

-- Same fix for challenges ALL policy
DROP POLICY IF EXISTS "Admins can manage org challenges" ON public.challenges;

CREATE POLICY "Admins can manage org challenges" ON public.challenges FOR ALL TO authenticated
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

-- Same fix for challenge_assignments ALL policy
DROP POLICY IF EXISTS "Admins can manage challenge assignments" ON public.challenge_assignments;

CREATE POLICY "Admins can manage challenge assignments" ON public.challenge_assignments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM challenges c WHERE c.id = challenge_assignments.challenge_id AND c.organization_id = user_org_id(auth.uid())
))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM challenges c WHERE c.id = challenge_assignments.challenge_id AND c.organization_id = user_org_id(auth.uid())
));