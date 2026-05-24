-- Revoke broad EXECUTE on SECURITY DEFINER functions, then grant only where needed.

-- Trigger functions: never called directly from API; revoke from all roles.
REVOKE ALL ON FUNCTION public.prevent_status_self_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_notification_type() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_profile_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Admin RPC: signed-in only (function checks has_role internally).
REVOKE ALL ON FUNCTION public.update_profile_status(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_profile_status(uuid, text) TO authenticated;

-- Auth event logger: called by signed-in users to record login events.
REVOKE ALL ON FUNCTION public.insert_auth_event(text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.insert_auth_event(text, text, text, text, jsonb) TO authenticated;

-- has_role: referenced by RLS policies; must be executable by both anon and authenticated.
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;