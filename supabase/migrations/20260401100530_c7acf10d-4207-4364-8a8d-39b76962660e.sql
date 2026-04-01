CREATE OR REPLACE FUNCTION public.can_access_challenge(_user_id uuid, _challenge_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.challenges c
    WHERE c.id = _challenge_id
      AND c.organization_id = public.user_org_id(_user_id)
      AND (
        public.has_role(_user_id, 'admin'::public.app_role)
        OR EXISTS (
          SELECT 1
          FROM public.challenge_assignments ca
          WHERE ca.challenge_id = c.id
            AND ca.user_id = _user_id
        )
        OR EXISTS (
          SELECT 1
          FROM public.challenge_assignments ca
          JOIN public.team_members tm ON tm.team_id = ca.team_id
          WHERE ca.challenge_id = c.id
            AND tm.user_id = _user_id
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_challenge_action(_user_id uuid, _challenge_action_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.challenge_actions ca
    WHERE ca.id = _challenge_action_id
      AND public.can_access_challenge(_user_id, ca.challenge_id)
  );
$$;

DROP POLICY IF EXISTS "Users can view assigned challenges" ON public.challenges;
CREATE POLICY "Users can view assigned challenges"
ON public.challenges
FOR SELECT
TO authenticated
USING (
  NOT public.has_role(auth.uid(), 'admin'::public.app_role)
  AND public.can_access_challenge(auth.uid(), id)
);

DROP POLICY IF EXISTS "Users can view challenge actions" ON public.challenge_actions;
CREATE POLICY "Users can view challenge actions"
ON public.challenge_actions
FOR SELECT
TO authenticated
USING (
  public.can_access_challenge(auth.uid(), challenge_id)
);

DROP POLICY IF EXISTS "Admins can view org completions" ON public.challenge_action_completions;
CREATE POLICY "Admins can view org completions"
ON public.challenge_action_completions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  AND public.can_access_challenge_action(auth.uid(), challenge_action_id)
);

DROP POLICY IF EXISTS "Users can view own completions" ON public.challenge_action_completions;
CREATE POLICY "Users can view own completions"
ON public.challenge_action_completions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND public.can_access_challenge_action(auth.uid(), challenge_action_id)
);

DROP POLICY IF EXISTS "Users can view team completions" ON public.challenge_action_completions;
CREATE POLICY "Users can view team completions"
ON public.challenge_action_completions
FOR SELECT
TO authenticated
USING (
  user_id <> auth.uid()
  AND public.shares_team_with(auth.uid(), user_id)
  AND public.can_access_challenge_action(auth.uid(), challenge_action_id)
);

DROP POLICY IF EXISTS "Users can insert own completions" ON public.challenge_action_completions;
CREATE POLICY "Users can insert own completions"
ON public.challenge_action_completions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND public.can_access_challenge_action(auth.uid(), challenge_action_id)
);