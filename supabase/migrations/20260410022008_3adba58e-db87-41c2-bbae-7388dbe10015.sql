-- 1. Extend status protection trigger to also cover INSERT (prevent users setting status='approved' on signup)
CREATE OR REPLACE FUNCTION public.prevent_status_self_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- On INSERT, force status to 'pending' unless caller is admin
    IF NOT has_role(auth.uid(), 'admin') THEN
      NEW.status := 'pending';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT has_role(auth.uid(), 'admin') THEN
        NEW.status := OLD.status;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop old trigger and recreate for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trg_prevent_status_self_change ON public.profiles;
CREATE TRIGGER trg_prevent_status_self_change
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_status_self_change();

-- 2. Tighten contact_messages admin policies from public to authenticated
DROP POLICY IF EXISTS "Admins can read contacts" ON public.contact_messages;
CREATE POLICY "Admins can read contacts"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update contacts" ON public.contact_messages;
CREATE POLICY "Admins can update contacts"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Tighten auth_events admin SELECT from public to authenticated
DROP POLICY IF EXISTS "Admins can read auth_events" ON public.auth_events;
CREATE POLICY "Admins can read auth_events"
  ON public.auth_events
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Tighten profiles admin SELECT from public to authenticated
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Tighten profiles INSERT from public to authenticated
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 6. Tighten profiles own SELECT from public to authenticated  
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);