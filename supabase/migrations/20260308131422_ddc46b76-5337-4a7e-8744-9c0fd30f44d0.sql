
-- Allow collaborators to view profiles of teammates
CREATE POLICY "Collaborators can view team profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (NOT has_role(auth.uid(), 'admin'::app_role))
  AND (NOT has_role(auth.uid(), 'manager'::app_role))
  AND organization_id = user_org_id(auth.uid())
  AND shares_team_with(auth.uid(), id)
);

-- Allow users to view roles of teammates
CREATE POLICY "Users can view team member roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  shares_team_with(auth.uid(), user_id)
);
