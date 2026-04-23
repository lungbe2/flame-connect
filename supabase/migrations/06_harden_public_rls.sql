-- Harden Row Level Security for public app tables.
-- This migration keeps browser access working with the anon/publishable key,
-- but restricts data access to authenticated users and rows they are involved in.

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Authenticated users can view profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view profiles"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id)
      WITH CHECK ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'likes'
      AND policyname = 'Users can view likes involving them'
  ) THEN
    CREATE POLICY "Users can view likes involving them"
      ON public.likes
      FOR SELECT
      TO authenticated
      USING (
        (SELECT auth.uid()) IS NOT NULL
        AND ((SELECT auth.uid()) = liker_id OR (SELECT auth.uid()) = liked_id)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'likes'
      AND policyname = 'Users can insert own likes'
  ) THEN
    CREATE POLICY "Users can insert own likes"
      ON public.likes
      FOR INSERT
      TO authenticated
      WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL
        AND (SELECT auth.uid()) = liker_id
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'matches'
      AND policyname = 'Users can view matches involving them'
  ) THEN
    CREATE POLICY "Users can view matches involving them"
      ON public.matches
      FOR SELECT
      TO authenticated
      USING (
        (SELECT auth.uid()) IS NOT NULL
        AND ((SELECT auth.uid()) = user_a OR (SELECT auth.uid()) = user_b)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'matches'
      AND policyname = 'Users can insert matches involving them'
  ) THEN
    CREATE POLICY "Users can insert matches involving them"
      ON public.matches
      FOR INSERT
      TO authenticated
      WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL
        AND ((SELECT auth.uid()) = user_a OR (SELECT auth.uid()) = user_b)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'matches'
      AND policyname = 'Users can update matches involving them'
  ) THEN
    CREATE POLICY "Users can update matches involving them"
      ON public.matches
      FOR UPDATE
      TO authenticated
      USING (
        (SELECT auth.uid()) IS NOT NULL
        AND ((SELECT auth.uid()) = user_a OR (SELECT auth.uid()) = user_b)
      )
      WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL
        AND ((SELECT auth.uid()) = user_a OR (SELECT auth.uid()) = user_b)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'Users can view messages in own matches'
  ) THEN
    CREATE POLICY "Users can view messages in own matches"
      ON public.messages
      FOR SELECT
      TO authenticated
      USING (
        (SELECT auth.uid()) IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.matches
          WHERE matches.id = messages.match_id
            AND ((SELECT auth.uid()) = matches.user_a OR (SELECT auth.uid()) = matches.user_b)
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'Users can insert messages in own matches'
  ) THEN
    CREATE POLICY "Users can insert messages in own matches"
      ON public.messages
      FOR INSERT
      TO authenticated
      WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL
        AND sender_id = (SELECT auth.uid())
        AND EXISTS (
          SELECT 1
          FROM public.matches
          WHERE matches.id = messages.match_id
            AND ((SELECT auth.uid()) = matches.user_a OR (SELECT auth.uid()) = matches.user_b)
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'Users can update messages in own matches'
  ) THEN
    CREATE POLICY "Users can update messages in own matches"
      ON public.messages
      FOR UPDATE
      TO authenticated
      USING (
        (SELECT auth.uid()) IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.matches
          WHERE matches.id = messages.match_id
            AND ((SELECT auth.uid()) = matches.user_a OR (SELECT auth.uid()) = matches.user_b)
        )
      )
      WITH CHECK (
        (SELECT auth.uid()) IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM public.matches
          WHERE matches.id = messages.match_id
            AND ((SELECT auth.uid()) = matches.user_a OR (SELECT auth.uid()) = matches.user_b)
        )
      );
  END IF;
END $$;
