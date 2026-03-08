
-- Drop any existing triggers on auth.users to avoid duplicates
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_first_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap_org ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_invite ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_a_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_b_first_admin ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_c_bootstrap_org ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_d_invite ON auth.users;

-- 1) Create profile on signup (fires first alphabetically)
CREATE TRIGGER on_auth_user_created_a_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2) Assign admin role if no admin exists yet
CREATE TRIGGER on_auth_user_created_b_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_first_admin();

-- 3) Create bootstrap org if this is the first admin
CREATE TRIGGER on_auth_user_created_c_bootstrap_org
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bootstrap_org();

-- 4) Process invite token for non-bootstrap signups
CREATE TRIGGER on_auth_user_created_d_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_invite_on_signup();
