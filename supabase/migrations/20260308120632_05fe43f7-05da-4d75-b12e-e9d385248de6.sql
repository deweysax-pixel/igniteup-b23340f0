-- Add team_id column to invitations
ALTER TABLE public.invitations ADD COLUMN team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

-- Update the process_invite_on_signup trigger to also assign team
CREATE OR REPLACE FUNCTION public.process_invite_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
  invite_token UUID;
BEGIN
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

      -- Assign to team if specified
      IF invite_record.team_id IS NOT NULL THEN
        INSERT INTO public.team_members (user_id, team_id, role)
        VALUES (NEW.id, invite_record.team_id, 'member')
        ON CONFLICT DO NOTHING;
      END IF;

      -- Mark invite as accepted
      UPDATE public.invitations
      SET status = 'accepted', accepted_at = now()
      WHERE id = invite_record.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;