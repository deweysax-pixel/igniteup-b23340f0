
-- challenge_actions: weekly actions within a challenge
CREATE TABLE public.challenge_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  label text NOT NULL,
  points integer NOT NULL DEFAULT 10,
  moment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.challenge_actions ENABLE ROW LEVEL SECURITY;

-- Users can view actions for challenges they can see (same org)
CREATE POLICY "Users can view challenge actions"
ON public.challenge_actions FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.challenges c
  WHERE c.id = challenge_actions.challenge_id
    AND c.organization_id = user_org_id(auth.uid())
));

-- Admins can manage challenge actions
CREATE POLICY "Admins can manage challenge actions"
ON public.challenge_actions FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.challenges c
  WHERE c.id = challenge_actions.challenge_id
    AND c.organization_id = user_org_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.challenges c
  WHERE c.id = challenge_actions.challenge_id
    AND c.organization_id = user_org_id(auth.uid())
    AND has_role(auth.uid(), 'admin')
));

-- challenge_action_completions: per-user per-action completion
CREATE TABLE public.challenge_action_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_action_id uuid NOT NULL REFERENCES public.challenge_actions(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'completed',
  xp_earned integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_action_id)
);

ALTER TABLE public.challenge_action_completions ENABLE ROW LEVEL SECURITY;

-- Users can view own completions
CREATE POLICY "Users can view own completions"
ON public.challenge_action_completions FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can insert own completions
CREATE POLICY "Users can insert own completions"
ON public.challenge_action_completions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Admins can view all completions in org
CREATE POLICY "Admins can view org completions"
ON public.challenge_action_completions FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  AND EXISTS (
    SELECT 1 FROM public.challenge_actions ca
    JOIN public.challenges c ON c.id = ca.challenge_id
    WHERE ca.id = challenge_action_completions.challenge_action_id
      AND c.organization_id = user_org_id(auth.uid())
  )
);

-- Users can view teammate completions
CREATE POLICY "Users can view team completions"
ON public.challenge_action_completions FOR SELECT TO authenticated
USING (
  user_id != auth.uid()
  AND shares_team_with(auth.uid(), user_id)
);
