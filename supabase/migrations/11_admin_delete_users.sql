CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  requester_email TEXT;
  target_email TEXT;
  deleted_profile_id UUID;
BEGIN
  requester_email := COALESCE(auth.jwt() ->> 'email', '');

  IF requester_email <> 'lungbe2@gmail.com' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT email
  INTO target_email
  FROM public.profiles
  WHERE id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF target_email = 'lungbe2@gmail.com' THEN
    RAISE EXCEPTION 'Admin account cannot be deleted';
  END IF;

  DELETE FROM public.profiles
  WHERE id = target_user_id
  RETURNING id INTO deleted_profile_id;

  IF deleted_profile_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  DELETE FROM auth.users
  WHERE id = target_user_id;

  RETURN jsonb_build_object(
    'id', deleted_profile_id,
    'email', target_email,
    'deleted', TRUE
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;
