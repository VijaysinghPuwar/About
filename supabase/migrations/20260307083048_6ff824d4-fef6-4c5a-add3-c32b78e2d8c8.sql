ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

CREATE OR REPLACE FUNCTION public.validate_profile_status()
RETURNS trigger LANGUAGE plpgsql AS $fn$
BEGIN
  IF NEW.status NOT IN ('pending', 'approved', 'blocked') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS check_profile_status ON public.profiles;
CREATE TRIGGER check_profile_status
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_status();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $fn$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    'pending'
  );
  
  INSERT INTO public.admin_notifications (type, user_email, user_name, user_id, message)
  VALUES (
    'new_signup',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Unknown'),
    NEW.id,
    'New user signed up: ' || NEW.email
  );
  
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_profile_status(target_user_id uuid, new_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF new_status NOT IN ('pending', 'approved', 'blocked') THEN
    RAISE EXCEPTION 'Invalid status value';
  END IF;
  UPDATE profiles SET status = new_status WHERE user_id = target_user_id;
END;
$fn$;

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own non-status fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  user_email text,
  user_name text,
  user_id uuid,
  message text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications"
ON public.admin_notifications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notifications"
ON public.admin_notifications
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert notifications"
ON public.admin_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);