ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_confirmed BOOLEAN DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  supplied_birth_date DATE;
  supplied_display_name TEXT;
BEGIN
  BEGIN
    supplied_birth_date := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'birth_date', '')), '')::DATE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'valid_birth_date_required';
  END;

  IF supplied_birth_date IS NULL THEN
    RAISE EXCEPTION 'adult_birth_date_required';
  END IF;

  IF supplied_birth_date > ((CURRENT_DATE - INTERVAL '18 years')::DATE) THEN
    RAISE EXCEPTION 'adults_only';
  END IF;

  supplied_display_name := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'display_name', '')), '');

  INSERT INTO public.profiles (id, email, display_name, birth_date, age_confirmed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(supplied_display_name, SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)),
    supplied_birth_date,
    TRUE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
