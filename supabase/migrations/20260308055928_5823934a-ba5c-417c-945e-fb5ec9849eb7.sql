
-- Organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Add organization_id to profiles
ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Validation trigger: admin role cannot be invited
CREATE OR REPLACE FUNCTION public.validate_invitation_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    RAISE EXCEPTION 'Admin role cannot be assigned via invitation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_invitation_role
  BEFORE INSERT OR UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.validate_invitation_role();

-- RLS for organizations: members can view their org, admins can manage
CREATE POLICY "Members can view own organization"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS for invitations: admins can CRUD, invited users can view their own
CREATE POLICY "Admins can manage invitations"
  ON public.invitations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own invitation by email"
  ON public.invitations FOR SELECT
  USING (lower(email) = lower(auth.jwt()->>'email'));

-- Update profiles RLS to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to process invite on signup
CREATE OR REPLACE FUNCTION public.process_invite_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invite_record RECORD;
  invite_token UUID;
BEGIN
  -- Check if user signed up with an invite token in metadata
  invite_token := (NEW.raw_user_meta_data->>'invite_token')::UUID;

  IF invite_token IS NOT NULL THEN
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE token = invite_token
      AND status = 'pending'
      AND lower(email) = lower(NEW.email)
      AND expires_at > now();

    IF FOUND THEN
      -- Assign role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, invite_record.role)
      ON CONFLICT (user_id, role) DO NOTHING;

      -- Set organization on profile
      UPDATE public.profiles
      SET organization_id = invite_record.organization_id
      WHERE id = NEW.id;

      -- Mark invite as accepted
      UPDATE public.invitations
      SET status = 'accepted', accepted_at = now()
      WHERE id = invite_record.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger after insert on auth.users (runs after handle_new_user)
CREATE TRIGGER on_auth_user_created_process_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.process_invite_on_signup();
