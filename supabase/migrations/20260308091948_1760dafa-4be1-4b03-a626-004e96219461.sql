
-- Helper: get user's organization_id
CREATE OR REPLACE FUNCTION public.user_org_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- 1. teams
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org teams" ON public.teams
  FOR SELECT USING (organization_id = public.user_org_id(auth.uid()));
CREATE POLICY "Admins can manage org teams" ON public.teams
  FOR ALL USING (organization_id = public.user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (organization_id = public.user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role));

-- 2. team_members (no FK to auth.users per guidelines)
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.organization_id = public.user_org_id(auth.uid()))
  );
CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.organization_id = public.user_org_id(auth.uid()))
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.organization_id = public.user_org_id(auth.uid()))
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 3. challenges
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'upcoming',
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org challenges" ON public.challenges
  FOR SELECT USING (organization_id = public.user_org_id(auth.uid()));
CREATE POLICY "Admins can manage org challenges" ON public.challenges
  FOR ALL USING (organization_id = public.user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (organization_id = public.user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role));

-- 4. challenge_assignments
CREATE TABLE public.challenge_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid,
  assigned_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.challenge_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org challenge assignments" ON public.challenge_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND c.organization_id = public.user_org_id(auth.uid()))
  );
CREATE POLICY "Admins can manage challenge assignments" ON public.challenge_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND c.organization_id = public.user_org_id(auth.uid()))
    AND public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND c.organization_id = public.user_org_id(auth.uid()))
    AND public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 5. check_ins
CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
  week_number int,
  note text,
  completed_actions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org check-ins" ON public.check_ins
  FOR SELECT USING (organization_id = public.user_org_id(auth.uid()));
CREATE POLICY "Users can insert own check-ins" ON public.check_ins
  FOR INSERT WITH CHECK (user_id = auth.uid() AND organization_id = public.user_org_id(auth.uid()));

-- 6. feedback_entries
CREATE TABLE public.feedback_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES public.challenges(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'general',
  content text,
  rating int,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org feedback" ON public.feedback_entries
  FOR SELECT USING (organization_id = public.user_org_id(auth.uid()));
CREATE POLICY "Users can insert own feedback" ON public.feedback_entries
  FOR INSERT WITH CHECK (user_id = auth.uid() AND organization_id = public.user_org_id(auth.uid()));

-- 7. scores
CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  xp int NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'Bronze',
  streak int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org scores" ON public.scores
  FOR SELECT USING (organization_id = public.user_org_id(auth.uid()));
CREATE POLICY "Users can upsert own score" ON public.scores
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. organization_metrics
CREATE TABLE public.organization_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_value numeric,
  period text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org metrics" ON public.organization_metrics
  FOR SELECT USING (organization_id = public.user_org_id(auth.uid()));
CREATE POLICY "Admins can manage org metrics" ON public.organization_metrics
  FOR ALL USING (organization_id = public.user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (organization_id = public.user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role));
