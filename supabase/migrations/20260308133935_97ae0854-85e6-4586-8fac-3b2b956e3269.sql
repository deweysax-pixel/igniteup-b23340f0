
-- 1. RPC for anonymous invite lookup (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_invite_info(_token uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'email', i.email,
    'role', i.role,
    'organization_name', o.name
  )
  FROM invitations i
  JOIN organizations o ON o.id = i.organization_id
  WHERE i.token = _token
    AND i.status = 'pending'
    AND i.expires_at > now()
$$;

-- 2. RPC for admin to remove a member from the org
CREATE OR REPLACE FUNCTION public.remove_org_member(_admin_id uuid, _member_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF _admin_id = _member_id THEN
    RAISE EXCEPTION 'Cannot remove yourself';
  END IF;
  DELETE FROM team_members WHERE user_id = _member_id;
  DELETE FROM user_roles WHERE user_id = _member_id;
  UPDATE profiles SET organization_id = NULL WHERE id = _member_id;
END;
$$;
