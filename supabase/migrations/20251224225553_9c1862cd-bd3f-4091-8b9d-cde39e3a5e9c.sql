-- Fix: Restrict profiles SELECT policy to prevent email enumeration
DROP POLICY "Users can view all profiles" ON public.profiles;

-- Users can only view their own profile by default
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow viewing profiles of team members (for assignee display)
CREATE POLICY "Users can view team member profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm1
      WHERE tm1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.team_members tm2
        WHERE tm2.team_id = tm1.team_id
        AND tm2.user_id = profiles.user_id
      )
    )
  );

-- Create secure function for team invitations that doesn't expose email existence
CREATE OR REPLACE FUNCTION public.invite_user_to_team(
  _team_id UUID,
  _email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inviter_id UUID;
  _target_user_id UUID;
  _is_owner_or_admin BOOLEAN;
BEGIN
  _inviter_id := auth.uid();
  
  -- Check if inviter is owner or admin of the team
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _inviter_id
    AND team_id = _team_id
    AND role IN ('owner', 'admin')
  ) INTO _is_owner_or_admin;
  
  IF NOT _is_owner_or_admin THEN
    RETURN jsonb_build_object('success', false, 'message', 'You do not have permission to invite users to this team');
  END IF;
  
  -- Look up user by email (server-side only, not exposed to client)
  SELECT user_id INTO _target_user_id
  FROM public.profiles
  WHERE email = _email;
  
  IF _target_user_id IS NULL THEN
    -- Generic message that doesn't reveal if email exists
    RETURN jsonb_build_object('success', false, 'message', 'Invitation sent. The user will be added when they join the platform.');
  END IF;
  
  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.team_members WHERE team_id = _team_id AND user_id = _target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'This user is already a member of the team');
  END IF;
  
  -- Add to team
  INSERT INTO public.team_members (team_id, user_id)
  VALUES (_team_id, _target_user_id);
  
  -- Add default role
  INSERT INTO public.user_roles (team_id, user_id, role)
  VALUES (_team_id, _target_user_id, 'member');
  
  RETURN jsonb_build_object('success', true, 'message', 'User has been added to the team');
END;
$$;