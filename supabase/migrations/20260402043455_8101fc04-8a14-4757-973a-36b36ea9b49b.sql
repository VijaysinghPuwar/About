-- 1. Remove open INSERT policy on admin_notifications
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.admin_notifications;

-- 2. Add a validation trigger for notification types (using trigger instead of CHECK for flexibility)
CREATE OR REPLACE FUNCTION public.validate_notification_type()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.type NOT IN ('suspicious_login', 'new_user', 'contact_message', 'project_access_request', 'status_change') THEN
    RAISE EXCEPTION 'Invalid notification type: %', NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_notification_type
  BEFORE INSERT ON public.admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_notification_type();

-- 3. Tighten user_roles ALL policy from public to authenticated
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Also tighten user_roles SELECT from public to authenticated
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);