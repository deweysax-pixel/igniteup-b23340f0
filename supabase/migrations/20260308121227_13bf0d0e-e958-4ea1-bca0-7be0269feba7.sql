-- Fix teams: drop restrictive SELECT policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can view org teams" ON public.teams;
DROP POLICY IF EXISTS "Managers can view own teams" ON public.teams;
DROP POLICY IF EXISTS "Members can view own teams" ON public.teams;

CREATE POLICY "Admins can view org teams" ON public.teams FOR SELECT TO authenticated
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can view own teams" ON public.teams FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'manager'::app_role) AND organization_id = user_org_id(auth.uid()) AND EXISTS (
  SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
));

CREATE POLICY "Members can view own teams" ON public.teams FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND NOT has_role(auth.uid(), 'manager'::app_role)
  AND organization_id = user_org_id(auth.uid()) AND EXISTS (
  SELECT 1 FROM team_members tm WHERE tm.team_id = teams.id AND tm.user_id = auth.uid()
));

-- Fix team_members: same issue
DROP POLICY IF EXISTS "Admins can view org team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view own team members" ON public.team_members;

CREATE POLICY "Admins can view org team members" ON public.team_members FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM teams t WHERE t.id = team_members.team_id AND t.organization_id = user_org_id(auth.uid())
));

CREATE POLICY "Users can view own team members" ON public.team_members FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM team_members my_tm WHERE my_tm.team_id = team_members.team_id AND my_tm.user_id = auth.uid()
));

-- Fix challenges
DROP POLICY IF EXISTS "Admins can view org challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can view assigned challenges" ON public.challenges;

CREATE POLICY "Admins can view org challenges" ON public.challenges FOR SELECT TO authenticated
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view assigned challenges" ON public.challenges FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND organization_id = user_org_id(auth.uid()) AND (
  EXISTS (SELECT 1 FROM challenge_assignments ca JOIN team_members tm ON tm.team_id = ca.team_id WHERE ca.challenge_id = challenges.id AND tm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM challenge_assignments ca WHERE ca.challenge_id = challenges.id AND ca.user_id = auth.uid())
));

-- Fix challenge_assignments
DROP POLICY IF EXISTS "Admins can view org challenge assignments" ON public.challenge_assignments;
DROP POLICY IF EXISTS "Users can view team challenge assignments" ON public.challenge_assignments;

CREATE POLICY "Admins can view org challenge assignments" ON public.challenge_assignments FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) AND EXISTS (
  SELECT 1 FROM challenges c WHERE c.id = challenge_assignments.challenge_id AND c.organization_id = user_org_id(auth.uid())
));

CREATE POLICY "Users can view team challenge assignments" ON public.challenge_assignments FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND (
  EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = challenge_assignments.team_id AND tm.user_id = auth.uid())
  OR user_id = auth.uid()
));

-- Fix check_ins
DROP POLICY IF EXISTS "Admins can view org check-ins" ON public.check_ins;
DROP POLICY IF EXISTS "Users can view team check-ins" ON public.check_ins;

CREATE POLICY "Admins can view org check-ins" ON public.check_ins FOR SELECT TO authenticated
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view team check-ins" ON public.check_ins FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND organization_id = user_org_id(auth.uid()) AND (user_id = auth.uid() OR shares_team_with(auth.uid(), user_id)));

-- Fix scores
DROP POLICY IF EXISTS "Admins can view org scores" ON public.scores;
DROP POLICY IF EXISTS "Users can view team scores" ON public.scores;

CREATE POLICY "Admins can view org scores" ON public.scores FOR SELECT TO authenticated
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view team scores" ON public.scores FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND organization_id = user_org_id(auth.uid()) AND (user_id = auth.uid() OR shares_team_with(auth.uid(), user_id)));

-- Fix feedback_entries
DROP POLICY IF EXISTS "Admins can view org feedback" ON public.feedback_entries;
DROP POLICY IF EXISTS "Users can view team feedback" ON public.feedback_entries;

CREATE POLICY "Admins can view org feedback" ON public.feedback_entries FOR SELECT TO authenticated
USING (organization_id = user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view team feedback" ON public.feedback_entries FOR SELECT TO authenticated
USING (NOT has_role(auth.uid(), 'admin'::app_role) AND organization_id = user_org_id(auth.uid()) AND (user_id = auth.uid() OR shares_team_with(auth.uid(), user_id)));