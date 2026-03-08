
-- Fix search_path on validate_invitation_role
CREATE OR REPLACE FUNCTION public.validate_invitation_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    RAISE EXCEPTION 'Admin role cannot be assigned via invitation';
  END IF;
  RETURN NEW;
END;
$$;
