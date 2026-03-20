-- Allow sponsors to view all teams in their organization
CREATE POLICY "Sponsors can view org teams"
ON public.teams
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'sponsor'::app_role)
  AND organization_id = user_org_id(auth.uid())
);

-- Allow sponsors to view all team members in their org teams
CREATE POLICY "Sponsors can view org team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'sponsor'::app_role)
  AND team_id IN (
    SELECT id FROM teams WHERE organization_id = user_org_id(auth.uid())
  )
);

-- Allow sponsors to view all org profiles
CREATE POLICY "Sponsors can view org profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'sponsor'::app_role)
  AND organization_id = user_org_id(auth.uid())
);

-- Allow sponsors to view all org check-ins
CREATE POLICY "Sponsors can view org check-ins"
ON public.check_ins
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'sponsor'::app_role)
  AND organization_id = user_org_id(auth.uid())
);

-- Allow sponsors to view all org scores
CREATE POLICY "Sponsors can view org scores"
ON public.scores
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'sponsor'::app_role)
  AND organization_id = user_org_id(auth.uid())
);