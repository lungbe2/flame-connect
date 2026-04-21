-- Phase 1.1 admin monetization controls: premium status management

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_plan TEXT;

CREATE OR REPLACE FUNCTION public.admin_set_user_premium_status(
  target_user_id UUID,
  should_be_premium BOOLEAN,
  plan TEXT DEFAULT NULL,
  premium_days INT DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_email TEXT;
  updated_row profiles%ROWTYPE;
  final_plan TEXT;
BEGIN
  requester_email := COALESCE(auth.jwt() ->> 'email', '');

  IF requester_email <> 'lungbe2@gmail.com' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  final_plan := COALESCE(NULLIF(plan, ''), 'monthly');

  UPDATE profiles
  SET
    is_premium = should_be_premium,
    premium_plan = CASE WHEN should_be_premium THEN final_plan ELSE NULL END,
    premium_until = CASE
      WHEN should_be_premium THEN NOW() + make_interval(days => GREATEST(COALESCE(premium_days, 30), 1))
      ELSE NULL
    END,
    last_seen = NOW()
  WHERE id = target_user_id
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN jsonb_build_object(
    'id', updated_row.id,
    'is_premium', updated_row.is_premium,
    'premium_plan', updated_row.premium_plan,
    'premium_until', updated_row.premium_until
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_premium_status(UUID, BOOLEAN, TEXT, INT) TO authenticated;
