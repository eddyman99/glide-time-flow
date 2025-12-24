-- Fix 1: Split labels ALL policy into separate policies with proper WITH CHECK

DROP POLICY IF EXISTS "Users can manage own labels" ON public.labels;

CREATE POLICY "Users can insert own labels" ON public.labels
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own labels" ON public.labels
  FOR UPDATE TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own labels" ON public.labels
  FOR DELETE TO authenticated 
  USING (user_id = auth.uid());

-- Fix 2: Create atomic team creation function to prevent orphaned teams

CREATE OR REPLACE FUNCTION public.create_team_with_owner(
  _name TEXT,
  _description TEXT DEFAULT NULL,
  _color TEXT DEFAULT '#6366f1'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _team_id UUID;
  _team_record RECORD;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- All operations in single atomic transaction
  INSERT INTO public.teams (name, description, color, created_by)
  VALUES (_name, _description, _color, _user_id)
  RETURNING id INTO _team_id;
  
  INSERT INTO public.team_members (team_id, user_id)
  VALUES (_team_id, _user_id);
  
  INSERT INTO public.user_roles (team_id, user_id, role)
  VALUES (_team_id, _user_id, 'owner');
  
  -- Return the created team as JSON
  SELECT INTO _team_record
    id, name, description, color, created_by, created_at, updated_at
  FROM public.teams
  WHERE id = _team_id;
  
  RETURN jsonb_build_object(
    'id', _team_record.id,
    'name', _team_record.name,
    'description', _team_record.description,
    'color', _team_record.color,
    'created_by', _team_record.created_by,
    'created_at', _team_record.created_at,
    'updated_at', _team_record.updated_at
  );
END;
$$;