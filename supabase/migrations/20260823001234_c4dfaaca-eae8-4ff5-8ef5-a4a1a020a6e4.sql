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
  END IF;
  RETURN NEW;
END;
$function$;

ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'approved';

UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';