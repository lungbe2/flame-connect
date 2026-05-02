# LiveKit Setup

This repo now includes the first backend foundation for LiveKit-based video rooms:

- `supabase/migrations/09_live_rooms_foundation.sql`
- `supabase/functions/livekit-token/index.ts`
- `src/lib/liveRooms.ts`

## 1. Create the database objects

Run:

- `supabase/migrations/09_live_rooms_foundation.sql`

This adds:

- `public.live_rooms`
- `public.live_room_memberships`

## 2. Set Supabase Edge Function secrets

Set these secrets before deploying the function:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Example values:

- `LIVEKIT_URL=wss://flame-connect-3bpwy38q.livekit.cloud`

## 3. Deploy the function

Recommended function name:

- `livekit-token`

## 4. How the token flow works

The frontend should call:

- `requestLiveKitRoomToken(roomName, requestedRole)`

The function then:

1. verifies the logged-in Supabase user
2. loads the room and membership
3. decides the final role
4. issues a short-lived LiveKit token

## 5. Suggested first room types

- `direct_call` for 1:1 calls
- `small_room` for small host/audience rooms

## 6. Suggested next frontend step

After adding the LiveKit client SDK, build:

- `Start video call` on a match
- `Join live room` for small rooms
- host/speaker/audience controls based on the returned role
