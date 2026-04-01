
-- Allow users to insert their own challenge assignments
CREATE POLICY "Users can insert own challenge assignments"
ON public.challenge_assignments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to update their own challenge assignments
CREATE POLICY "Users can update own challenge assignments"
ON public.challenge_assignments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
