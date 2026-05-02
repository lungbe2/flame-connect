import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { AccessToken } from 'npm:livekit-server-sdk';
import { corsHeaders } from '../_shared/cors.ts';

type RequestedRole = 'host' | 'speaker' | 'audience';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY') ?? '';
const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET') ?? '';
const livekitUrl = Deno.env.get('LIVEKIT_URL') ?? '';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !livekitApiKey || !livekitApiSecret || !livekitUrl) {
    return json(
      {
        error:
          'Missing required environment variables. Set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL.'
      },
      500
    );
  }

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization) {
      return json({ error: 'Missing Authorization header.' }, 401);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization
        }
      }
    });

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user },
      error: userError
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ error: 'Unauthorized.' }, 401);
    }

    const { roomName, requestedRole } = await request.json();

    if (typeof roomName !== 'string' || roomName.trim().length === 0) {
      return json({ error: 'roomName is required.' }, 400);
    }

    const requested = (requestedRole || 'audience') as RequestedRole;

    const { data: room, error: roomError } = await serviceClient
      .from('live_rooms')
      .select('*')
      .eq('room_name', roomName.trim())
      .single();

    if (roomError || !room) {
      return json({ error: 'Live room not found.' }, 404);
    }

    const { data: membership } = await serviceClient
      .from('live_room_memberships')
      .select('*')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membership?.status === 'banned') {
      return json({ error: 'You are banned from this room.' }, 403);
    }

    const isHost = room.host_user_id === user.id;
    const actualRole: RequestedRole = isHost
      ? 'host'
      : membership?.role === 'speaker'
        ? 'speaker'
        : 'audience';

    const canAccessPrivateRoom =
      room.visibility === 'public' ||
      isHost ||
      (membership && membership.status !== 'banned' && membership.status !== 'left');

    if (!canAccessPrivateRoom) {
      return json({ error: 'You do not have access to this room.' }, 403);
    }

    if (!membership) {
      await serviceClient.from('live_room_memberships').insert({
        room_id: room.id,
        user_id: user.id,
        role: actualRole,
        status: 'active'
      });
    } else if (membership.status !== 'active') {
      await serviceClient
        .from('live_room_memberships')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('room_id', room.id)
        .eq('user_id', user.id);
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: user.id,
      name: profile?.display_name || user.email || user.id,
      ttl: '10m',
      metadata: JSON.stringify({
        roomId: room.id,
        role: actualRole
      })
    });

    token.addGrant({
      room: room.room_name,
      roomJoin: true,
      canPublish: actualRole === 'host' || actualRole === 'speaker',
      canSubscribe: true,
      canPublishData: true
    });

    return json({
      token: await token.toJwt(),
      url: livekitUrl,
      room: {
        id: room.id,
        roomName: room.room_name,
        title: room.title,
        role: actualRole,
        requestedRole: requested,
        type: room.room_type,
        visibility: room.visibility
      }
    });
  } catch (error) {
    console.error('livekit-token error', error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500);
  }
});
