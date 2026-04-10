-- Tighten profiles UPDATE policy to prevent status changes at RLS level
DROP POLICY IF EXISTS "Users can update own non-status fields" ON public.profiles;
CREATE POLICY "Users can update own non-status fields"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      status = (SELECT p.status FROM public.profiles p WHERE p.user_id = auth.uid())
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );