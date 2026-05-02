CREATE TABLE IF NOT EXISTS public.live_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_name TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL DEFAULT 'small_room' CHECK (room_type IN ('direct_call', 'small_room')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'invite_only')),
  host_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  max_participants INTEGER NOT NULL DEFAULT 8 CHECK (max_participants >= 2 AND max_participants <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.live_room_memberships (
  room_id UUID NOT NULL REFERENCES public.live_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'audience' CHECK (role IN ('host', 'speaker', 'audience')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'left', 'banned')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS live_rooms_host_user_id_idx ON public.live_rooms(host_user_id);
CREATE INDEX IF NOT EXISTS live_rooms_status_idx ON public.live_rooms(status);
CREATE INDEX IF NOT EXISTS live_room_memberships_user_id_idx ON public.live_room_memberships(user_id);
CREATE INDEX IF NOT EXISTS live_room_memberships_status_idx ON public.live_room_memberships(status);

ALTER TABLE public.live_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_room_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible live rooms"
ON public.live_rooms
FOR SELECT
USING (
  visibility = 'public'
  OR host_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.live_room_memberships membership
    WHERE membership.room_id = live_rooms.id
      AND membership.user_id = auth.uid()
      AND membership.status IN ('invited', 'active')
  )
);

CREATE POLICY "Hosts can create live rooms"
ON public.live_rooms
FOR INSERT
WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Hosts can update own live rooms"
ON public.live_rooms
FOR UPDATE
USING (host_user_id = auth.uid())
WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Hosts can delete own live rooms"
ON public.live_rooms
FOR DELETE
USING (host_user_id = auth.uid());

CREATE POLICY "Users can view own live memberships or hosted rooms"
ON public.live_room_memberships
FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.live_rooms room
    WHERE room.id = live_room_memberships.room_id
      AND room.host_user_id = auth.uid()
  )
);

CREATE POLICY "Users can join themselves or hosts can manage memberships"
ON public.live_room_memberships
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.live_rooms room
    WHERE room.id = live_room_memberships.room_id
      AND room.host_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own membership or hosts can manage memberships"
ON public.live_room_memberships
FOR UPDATE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.live_rooms room
    WHERE room.id = live_room_memberships.room_id
      AND room.host_user_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.live_rooms room
    WHERE room.id = live_room_memberships.room_id
      AND room.host_user_id = auth.uid()
  )
);

CREATE POLICY "Users can leave memberships or hosts can remove memberships"
ON public.live_room_memberships
FOR DELETE
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.live_rooms room
    WHERE room.id = live_room_memberships.room_id
      AND room.host_user_id = auth.uid()
  )
);
