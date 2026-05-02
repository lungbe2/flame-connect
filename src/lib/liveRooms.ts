import { supabase } from './supabase';

const buildDirectRoomName = (userA: string, userB: string) => {
  const [first, second] = [userA, userB].sort();
  return `direct-${first}-${second}`;
};

type DirectCallInput = {
  currentUserId: string;
  currentUserName: string;
  targetUserId: string;
  targetUserName: string;
};

export async function requestLiveKitRoomToken(roomName: string, requestedRole: 'host' | 'speaker' | 'audience' = 'audience') {
  const { data, error } = await supabase.functions.invoke('livekit-token', {
    body: {
      roomName,
      requestedRole
    }
  });

  if (error) {
    throw error;
  }

  return data as {
    token: string;
    url: string;
    room: {
      id: string;
      roomName: string;
      title: string;
      role: 'host' | 'speaker' | 'audience';
      requestedRole: 'host' | 'speaker' | 'audience';
      type: 'direct_call' | 'small_room';
      visibility: 'private' | 'public' | 'invite_only';
    };
  };
}

export async function ensureDirectCallRoom({ currentUserId, currentUserName, targetUserId, targetUserName }: DirectCallInput) {
  const roomName = buildDirectRoomName(currentUserId, targetUserId);
  const title = `${currentUserName} and ${targetUserName}`;

  const { data: existingRoom, error: lookupError } = await supabase
    .from('live_rooms')
    .select('*')
    .eq('room_name', roomName)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  let room = existingRoom;

  if (!room) {
    const { data: createdRoom, error: createError } = await supabase
      .from('live_rooms')
      .insert({
        room_name: roomName,
        title,
        description: `Private video call between ${currentUserName} and ${targetUserName}.`,
        room_type: 'direct_call',
        visibility: 'private',
        host_user_id: currentUserId,
        status: 'scheduled',
        max_participants: 2
      })
      .select('*')
      .single();

    if (createError || !createdRoom) {
      throw createError || new Error('Unable to create the video room.');
    }

    room = createdRoom;
  }

  const currentUserRole = room.host_user_id === currentUserId ? 'host' : 'speaker';
  const targetUserRole = room.host_user_id === targetUserId ? 'host' : 'speaker';
  const membershipRows = [
    {
      room_id: room.id,
      user_id: currentUserId,
      role: currentUserRole,
      status: 'active'
    }
  ];

  if (room.host_user_id === currentUserId) {
    membershipRows.push({
      room_id: room.id,
      user_id: targetUserId,
      role: targetUserRole,
      status: 'invited'
    } as any);
  }

  const { error: membershipError } = await supabase.from('live_room_memberships').upsert(membershipRows, { onConflict: 'room_id,user_id' });

  if (membershipError) {
    throw membershipError;
  }

  if (room.host_user_id === currentUserId && room.status === 'scheduled') {
    const { data: updatedRoom, error: updateError } = await supabase
      .from('live_rooms')
      .update({
        status: 'live',
        started_at: room.started_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', room.id)
      .select('*')
      .single();

    if (!updateError && updatedRoom) {
      room = updatedRoom;
    }
  }

  return {
    id: room.id,
    roomName: room.room_name,
    title: room.title,
    requestedRole: currentUserRole as 'host' | 'speaker'
  };
}
