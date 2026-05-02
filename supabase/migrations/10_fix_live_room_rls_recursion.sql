DROP POLICY IF EXISTS "Users can view accessible live rooms" ON public.live_rooms;
DROP POLICY IF EXISTS "Hosts can create live rooms" ON public.live_rooms;
DROP POLICY IF EXISTS "Hosts can update own live rooms" ON public.live_rooms;
DROP POLICY IF EXISTS "Hosts can delete own live rooms" ON public.live_rooms;

DROP POLICY IF EXISTS "Users can view own live memberships or hosted rooms" ON public.live_room_memberships;
DROP POLICY IF EXISTS "Users can join themselves or hosts can manage memberships" ON public.live_room_memberships;
DROP POLICY IF EXISTS "Users can update own membership or hosts can manage memberships" ON public.live_room_memberships;
DROP POLICY IF EXISTS "Users can leave memberships or hosts can remove memberships" ON public.live_room_memberships;

CREATE OR REPLACE FUNCTION public.is_live_room_host(target_room_id UUID, target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.live_rooms
    WHERE id = target_room_id
      AND host_user_id = target_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_live_room_host(UUID, UUID) TO authenticated;

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
  OR public.is_live_room_host(room_id, auth.uid())
);

CREATE POLICY "Users can join themselves or hosts can manage memberships"
ON public.live_room_memberships
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.is_live_room_host(room_id, auth.uid())
);

CREATE POLICY "Users can update own membership or hosts can manage memberships"
ON public.live_room_memberships
FOR UPDATE
USING (
  user_id = auth.uid()
  OR public.is_live_room_host(room_id, auth.uid())
)
WITH CHECK (
  user_id = auth.uid()
  OR public.is_live_room_host(room_id, auth.uid())
);

CREATE POLICY "Users can leave memberships or hosts can remove memberships"
ON public.live_room_memberships
FOR DELETE
USING (
  user_id = auth.uid()
  OR public.is_live_room_host(room_id, auth.uid())
);
