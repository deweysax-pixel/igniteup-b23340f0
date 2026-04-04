
-- Create catalog_modules table
CREATE TABLE public.catalog_modules (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  total_duration_minutes INTEGER,
  short_description TEXT NOT NULL DEFAULT '',
  learning_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  core_lesson JSONB NOT NULL DEFAULT '[]'::jsonb,
  level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create module_weeks table
CREATE TABLE public.module_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES public.catalog_modules(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_prompt TEXT,
  xp INTEGER NOT NULL DEFAULT 10,
  support_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (module_id, week_number)
);

-- Enable RLS
ALTER TABLE public.catalog_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_weeks ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read catalog
CREATE POLICY "Authenticated users can view catalog modules"
  ON public.catalog_modules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage catalog modules"
  ON public.catalog_modules FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view module weeks"
  ON public.module_weeks FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage module weeks"
  ON public.module_weeks FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
