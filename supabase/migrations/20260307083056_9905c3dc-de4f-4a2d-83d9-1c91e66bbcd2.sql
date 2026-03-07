-- Fix search_path on validate_profile_status
CREATE OR REPLACE FUNCTION public.validate_profile_status()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $fn$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'blocked') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  RETURN NEW;
END;
$fn$;

-- Fix permissive INSERT policy on admin_notifications - restrict to trigger/service role context
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.admin_notifications;
CREATE POLICY "Authenticated users can insert notifications"
ON public.admin_notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());