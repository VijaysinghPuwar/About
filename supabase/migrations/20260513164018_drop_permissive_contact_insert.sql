-- Drop the permissive anonymous INSERT policy on contact_messages.
-- The send-contact-email edge function uses the service_role key to
-- insert legitimate submissions, so dropping this anon-accessible policy
-- does not break the contact form — but it does prevent direct INSERT
-- via the publishable key, which was bypassing rate limiting.

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
