import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent, Track, VideoPresets, type Participant } from 'livekit-client';
import { requestLiveKitRoomToken } from '../lib/liveRooms';

function ParticipantTile({ participant, isLocal = false }: { participant: Participant; isLocal?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cameraTrack = participant.getTrackPublication(Track.Source.Camera)?.track;
  const microphoneTrack = participant.getTrackPublication(Track.Source.Microphone)?.track;
  const participantName = participant.name || participant.identity || (isLocal ? 'You' : 'Guest');

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !cameraTrack) {
      return;
    }

    cameraTrack.attach(element);
    return () => {
      cameraTrack.detach(element);
    };
  }, [cameraTrack, participant.sid]);

  useEffect(() => {
    const element = audioRef.current;
    if (!element || !microphoneTrack || isLocal) {
      return;
    }

    microphoneTrack.attach(element);
    return () => {
      microphoneTrack.detach(element);
    };
  }, [microphoneTrack, participant.sid, isLocal]);

  return (
    <article className="video-room-tile">
      {cameraTrack ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="video-room-media" />
      ) : (
        <div className="video-room-placeholder">
          <div className="video-room-avatar">{participantName.slice(0, 1).toUpperCase()}</div>
          <div className="video-room-placeholder-copy">{isLocal ? 'Camera is off' : 'Waiting for video'}</div>
        </div>
      )}
      {!isLocal && <audio ref={audioRef} autoPlay />}
      <div className="video-room-tile-bar">
        <strong>{participantName}</strong>
        <span>{isLocal ? 'You' : 'Live'}</span>
      </div>
    </article>
  );
}

export default function VideoRoomPage({
  roomName,
  roomTitle,
  requestedRole,
  currentUser,
  targetProfile,
  onBack
}: {
  roomName: string;
  roomTitle: string;
  requestedRole: 'host' | 'speaker' | 'audience';
  currentUser: any;
  targetProfile?: any;
  onBack: () => void;
}) {
  const roomRef = useRef<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState('');
  const [role, setRole] = useState<'host' | 'speaker' | 'audience'>(requestedRole);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(requestedRole !== 'audience');
  const [cameraEnabled, setCameraEnabled] = useState(requestedRole !== 'audience');

  useEffect(() => {
    let cancelled = false;

    const connectToRoom = async () => {
      try {
        setConnectionState('connecting');
        setErrorMessage('');

        const tokenPayload = await requestLiveKitRoomToken(roomName, requestedRole);
        if (cancelled) {
          return;
        }

        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution
          }
        });
        roomRef.current = room;

        const syncParticipants = () => {
          if (!roomRef.current) {
            return;
          }

          const nextParticipants = [roomRef.current.localParticipant, ...Array.from(roomRef.current.remoteParticipants.values())] as Participant[];
          setParticipants(nextParticipants);
        };

        room
          .on(RoomEvent.ParticipantConnected, syncParticipants)
          .on(RoomEvent.ParticipantDisconnected, syncParticipants)
          .on(RoomEvent.TrackSubscribed, syncParticipants)
          .on(RoomEvent.TrackUnsubscribed, syncParticipants)
          .on(RoomEvent.LocalTrackPublished, syncParticipants)
          .on(RoomEvent.LocalTrackUnpublished, syncParticipants)
          .on(RoomEvent.Disconnected, () => {
            if (!cancelled) {
              setParticipants([]);
              setConnectionState('connecting');
            }
          });

        await room.connect(tokenPayload.url, tokenPayload.token);
        if (cancelled) {
          room.disconnect();
          return;
        }

        setRole(tokenPayload.room.role);
        setConnectionState('connected');
        syncParticipants();

        if (tokenPayload.room.role !== 'audience') {
          await room.localParticipant.setCameraEnabled(true);
          await room.localParticipant.setMicrophoneEnabled(true);
          setCameraEnabled(true);
          setMicrophoneEnabled(true);
          syncParticipants();
        } else {
          setCameraEnabled(false);
          setMicrophoneEnabled(false);
        }
      } catch (error: any) {
        console.error('Unable to join LiveKit room:', error);
        if (!cancelled) {
          setConnectionState('error');
          setErrorMessage(error?.message || 'Unable to join the video room right now.');
        }
      }
    };

    void connectToRoom();

    return () => {
      cancelled = true;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [roomName, requestedRole]);

  const leaveRoom = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    onBack();
  };

  const toggleMicrophone = async () => {
    if (!roomRef.current || role === 'audience') {
      return;
    }

    const next = !microphoneEnabled;
    await roomRef.current.localParticipant.setMicrophoneEnabled(next);
    setMicrophoneEnabled(next);
  };

  const toggleCamera = async () => {
    if (!roomRef.current || role === 'audience') {
      return;
    }

    const next = !cameraEnabled;
    await roomRef.current.localParticipant.setCameraEnabled(next);
    setCameraEnabled(next);
  };

  const roomSubtitle = useMemo(() => {
    if (role === 'host') {
      return 'You are hosting this call.';
    }
    if (role === 'speaker') {
      return `You are live with ${targetProfile?.display_name || targetProfile?.email?.split('@')[0] || 'your match'}.`;
    }
    return 'Audience mode is watch-only for this room.';
  }, [role, targetProfile]);

  return (
    <section className="video-room-shell">
      <header className="video-room-header">
        <div>
          <button type="button" onClick={leaveRoom} className="video-room-back">
            Back to chat
          </button>
          <h2>{roomTitle}</h2>
          <p>{roomSubtitle}</p>
        </div>
        <div className="video-room-badges">
          <span className="video-room-badge subtle">{role}</span>
          <span className={`video-room-badge ${connectionState === 'connected' ? 'live' : 'pending'}`}>{connectionState}</span>
        </div>
      </header>

      {connectionState === 'error' ? (
        <div className="video-room-status-card">
          <h3>Video room unavailable</h3>
          <p>{errorMessage}</p>
          <button type="button" onClick={leaveRoom} className="video-room-primary">
            Return to chat
          </button>
        </div>
      ) : (
        <>
          <div className="video-room-grid">
            {participants.map((participant) => (
              <ParticipantTile key={participant.sid} participant={participant} isLocal={participant.identity === currentUser?.id} />
            ))}
            {participants.length === 0 && (
              <div className="video-room-status-card">
                <h3>Joining room...</h3>
                <p>We're preparing your camera, microphone, and secure room access.</p>
              </div>
            )}
          </div>

          <div className="video-room-controls">
            <button type="button" onClick={toggleMicrophone} className="video-room-control" disabled={role === 'audience' || connectionState !== 'connected'}>
              {microphoneEnabled ? 'Mute mic' : 'Unmute mic'}
            </button>
            <button type="button" onClick={toggleCamera} className="video-room-control" disabled={role === 'audience' || connectionState !== 'connected'}>
              {cameraEnabled ? 'Turn camera off' : 'Turn camera on'}
            </button>
            <button type="button" onClick={leaveRoom} className="video-room-control danger">
              Leave room
            </button>
          </div>
        </>
      )}
    </section>
  );
}
