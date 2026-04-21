-- Add richer profile and messaging capabilities

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mood TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS location_city TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS media_url TEXT;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Keep moods flexible but constrained to requested options
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_mood_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_mood_check
      CHECK (mood IN ('horny', 'serious relationship', 'hook up', 'love', 'marriage') OR mood IS NULL);
  END IF;
END $$;

-- Ensure chat message content is always present, even for media-only messages
ALTER TABLE messages
  ALTER COLUMN content SET DEFAULT '';

-- Optional public bucket for chat media
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own chat media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload chat media'
  ) THEN
    CREATE POLICY "Users can upload chat media"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'chat-media');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can view chat media'
  ) THEN
    CREATE POLICY "Users can view chat media"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'chat-media');
  END IF;
END $$;
