
-- Remove wrongly-attached triggers on public.profiles
DROP TRIGGER IF EXISTS on_bootstrap_org_creation ON public.profiles;
DROP TRIGGER IF EXISTS on_first_admin_assignment ON public.profiles;

-- Remove duplicate invite trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_process_invite ON auth.users;
