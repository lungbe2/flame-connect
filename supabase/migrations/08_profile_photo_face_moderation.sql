ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_face_status TEXT DEFAULT 'pending'
  CHECK (photo_face_status IN ('pending', 'approved', 'flagged'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_face_count INTEGER DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_face_confidence NUMERIC;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_face_checked_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photo_face_review_note TEXT;

UPDATE public.profiles
SET
  photo_face_status = 'approved',
  photo_face_checked_at = COALESCE(photo_face_checked_at, NOW()),
  photo_face_review_note = COALESCE(photo_face_review_note, 'Legacy profile photo approved during rollout.')
WHERE COALESCE(array_length(photos, 1), 0) > 0
  AND COALESCE(photo_face_status, 'pending') = 'pending';
