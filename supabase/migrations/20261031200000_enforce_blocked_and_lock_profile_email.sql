-- Audit follow-ups, 31 October 2026. Additive only: no existing policy is
-- dropped, so nothing that works today loses access except blocked accounts.

-- 1. Enforce "blocked" on the server.
--
-- Until now a blocked status was only honoured by ProtectedRoute in the
-- browser. Through the API (or the MCP server) a blocked account could still
-- read basic and explicitly shared projects and write reading progress.
-- RESTRICTIVE policies are ANDed with the existing permissive ones, so they
-- only ever take access away.

CREATE OR REPLACE FUNCTION public.is_blocked(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND status = 'blocked'
  )
$$;

REVOKE ALL ON FUNCTION public.is_blocked(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_blocked(uuid) TO authenticated;

-- Public projects stay visible to everyone, blocked or not: they are public.
DROP POLICY IF EXISTS "Blocked users only see public projects" ON public.projects;
CREATE POLICY "Blocked users only see public projects"
  ON public.projects
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (access_level = 'public' OR NOT public.is_blocked(auth.uid()));

DROP POLICY IF EXISTS "Blocked users cannot see project access" ON public.project_access;
CREATE POLICY "Blocked users cannot see project access"
  ON public.project_access
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (NOT public.is_blocked(auth.uid()));

-- reading_progress is created by the Drizzle migration, which may not have
-- been applied to every database. Skip quietly rather than fail the deploy.
DO $$
BEGIN
  IF to_regclass('public.reading_progress') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Blocked users cannot use reading progress" ON public.reading_progress';
    EXECUTE $p$
      CREATE POLICY "Blocked users cannot use reading progress"
        ON public.reading_progress
        AS RESTRICTIVE
        FOR ALL
        TO authenticated
        USING (NOT public.is_blocked(auth.uid()))
        WITH CHECK (NOT public.is_blocked(auth.uid()))
    $p$;
  END IF;
END
$$;

-- 2. Users cannot rewrite the email on their own profile.
--
-- The admin panel lists people by profiles.email, and the self-update policy
-- allowed changing it, so an account could present itself as someone else.
-- The same trigger already pins status. Requests with no user (service role,
-- SQL editor) pass through, so server-side syncs keep working.

CREATE OR REPLACE FUNCTION public.prevent_status_self_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT has_role(auth.uid(), 'admin') THEN
        NEW.status := OLD.status;
      END IF;
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email
       AND auth.uid() IS NOT NULL
       AND NOT has_role(auth.uid(), 'admin') THEN
      NEW.email := OLD.email;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.prevent_status_self_change() FROM PUBLIC, anon, authenticated;

-- 3. Close the forged-audit-log path.
--
-- insert_auth_event let any signed-in user write auth_events rows with an
-- arbitrary email, IP, user agent and metadata, including the
-- "suspicious_activity" type the admin panel highlights. Nothing in the app
-- calls it: logins are recorded by the log-auth-event function, which verifies
-- the token and records the verified email. The function is kept, only the
-- grant is removed, so it can be restored without a schema change.

REVOKE ALL ON FUNCTION public.insert_auth_event(text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
