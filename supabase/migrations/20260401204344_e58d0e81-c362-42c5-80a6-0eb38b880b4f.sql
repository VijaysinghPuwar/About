-- 1. Drop unsafe auth_events public INSERT policy
DROP POLICY IF EXISTS "System can insert auth_events" ON public.auth_events;

-- 2. Create secure insert function for authenticated RPC usage
CREATE OR REPLACE FUNCTION public.insert_auth_event(
  p_event_type TEXT,
  p_email TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_event_type NOT IN ('login','logout','signup','token_refresh','password_reset','failed_login','suspicious_activity') THEN
    RAISE EXCEPTION 'Invalid event type: %', p_event_type;
  END IF;
  INSERT INTO public.auth_events (user_id, event_type, email, ip_address, user_agent, metadata)
  VALUES (auth.uid(), p_event_type, p_email, p_ip_address, p_user_agent, p_metadata);
END;
$$;

-- 3. Prevent non-admin users from changing their own status on profiles
CREATE OR REPLACE FUNCTION public.prevent_status_self_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT has_role(auth.uid(), 'admin') THEN
      NEW.status := OLD.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_status_self_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_status_self_change();