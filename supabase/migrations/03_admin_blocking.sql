-- Phase 1 admin moderation: block / unblock users

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

CREATE OR REPLACE FUNCTION public.admin_set_user_block_status(
  target_user_id UUID,
  should_block BOOLEAN,
  reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_email TEXT;
  updated_row profiles%ROWTYPE;
BEGIN
  requester_email := COALESCE(auth.jwt() ->> 'email', '');

  IF requester_email <> 'lungbe2@gmail.com' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE profiles
  SET
    is_blocked = should_block,
    blocked_at = CASE WHEN should_block THEN NOW() ELSE NULL END,
    blocked_reason = CASE WHEN should_block THEN NULLIF(reason, '') ELSE NULL END,
    is_online = CASE WHEN should_block THEN FALSE ELSE is_online END,
    last_seen = NOW()
  WHERE id = target_user_id
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN jsonb_build_object(
    'id', updated_row.id,
    'is_blocked', updated_row.is_blocked,
    'blocked_at', updated_row.blocked_at,
    'blocked_reason', updated_row.blocked_reason
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_block_status(UUID, BOOLEAN, TEXT) TO authenticated;
