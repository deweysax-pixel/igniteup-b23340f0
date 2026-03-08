
-- Handle bootstrap org creation: when the first admin signs up with bootstrap_org metadata,
-- create the org and assign it to their profile
CREATE OR REPLACE FUNCTION public.handle_bootstrap_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_name TEXT;
  org_id UUID;
BEGIN
  org_name := NEW.raw_user_meta_data->>'bootstrap_org';
  
  -- Only proceed if this is a bootstrap signup and user just became admin
  IF org_name IS NOT NULL AND org_name != '' THEN
    -- Check this user actually got the admin role (first admin trigger fired)
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = 'admin') THEN
      INSERT INTO public.organizations (name) VALUES (org_name) RETURNING id INTO org_id;
      UPDATE public.profiles SET organization_id = org_id WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- This trigger fires AFTER the first admin trigger, creating the org
CREATE TRIGGER on_bootstrap_org_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bootstrap_org();
