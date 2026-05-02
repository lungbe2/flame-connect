import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Onboarding from './components/Onboarding';
import PeopleGrid from './components/PeopleGrid.tsx';
import Inbox from './components/Inbox';
import Profile from './components/Profile';
import HomeDashboard from './components/HomeDashboard';
import FloatingChatDock from './components/FloatingChatDock';
import ChatPage from './pages/ChatPage';
import MatchPage from './pages/MatchPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ExplorePage from './pages/ExplorePage';
import HelpPage from './pages/HelpPage';
import CoachingPage from './pages/CoachingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import UpgradePage from './pages/UpgradePage';
import LandingPage from './components/LandingPage';
import AppShell from './components/AppShell';
import PeopleHub from './components/PeopleHub';
import { VIEW_KEYS } from './config/navigation';
import { validateProfilePhotoFace } from './lib/faceValidation';
import { ensureDirectCallRoom } from './lib/liveRooms';

const VideoRoomPage = lazy(() => import('./pages/VideoRoomPage'));

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

const toRadians = (value: number) => (value * Math.PI) / 180;

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c);
};

const calculateProfileCompletionScore = (profile: any) => {
  const checks = [
    !!profile?.display_name,
    !!profile?.age,
    !!profile?.gender,
    !!profile?.looking_for,
    !!profile?.mood,
    !!profile?.bio && profile.bio.length >= 20,
    !!profile?.location_city || !!profile?.location,
    Array.isArray(profile?.photos) && profile.photos.length > 0
  ];
  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const computeDiscoveryScore = (viewer: any, candidate: any, distanceKm: number | null) => {
  let score = 0;

  if (candidate?.is_online) {
    score += 20;
  }
  if (candidate?.mood && viewer?.mood && candidate.mood === viewer.mood) {
    score += 25;
  }
  if (candidate?.looking_for && viewer?.looking_for && candidate.looking_for === viewer.looking_for) {
    score += 15;
  }
  if (typeof distanceKm === 'number') {
    score += Math.max(0, 20 - Math.min(distanceKm, 20));
  }
  score += Math.round((candidate?.profile_completion_score || 0) * 0.2);

  return score;
};

const isRecentlyOnline = (record: any) => {
  const timestamp = record?.last_seen || record?.last_active;
  if (!timestamp) {
    return !!record?.is_online;
  }
  const elapsed = Date.now() - new Date(timestamp).getTime();
  return elapsed <= ONLINE_WINDOW_MS && !!record?.is_online;
};

const sortUserPair = (a: string, b: string) => [a, b].sort();
function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [currentView, setCurrentView] = useState(VIEW_KEYS.LANDING);
  const [users, setUsers] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<any[]>([]);
  const [chatRequests, setChatRequests] = useState<any[]>([]);
  const [unreadByUser, setUnreadByUser] = useState<Record<string, number>>({});
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [selectedVideoRoom, setSelectedVideoRoom] = useState<any>(null);
  const [showMatchModal, setShowMatchModal] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoFaceStatus, setPhotoFaceStatus] = useState<'pending' | 'approved' | 'flagged'>('pending');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [mood, setMood] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const currentUserId = user?.id || null;

  const myCoordinates = useMemo(() => {
    if (coords) {
      return coords;
    }
    if (profile?.latitude && profile?.longitude) {
      return { lat: profile.latitude, lng: profile.longitude };
    }
    return null;
  }, [coords, profile]);

  const fetchUsers = useCallback(async (activeUserId: string) => {
    const [profilesResult, likesResult, matchesResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .neq('id', activeUserId)
        .or('is_blocked.is.null,is_blocked.eq.false')
        .order('last_seen', { ascending: false }),
      supabase.from('likes').select('liked_id').eq('liker_id', activeUserId),
      supabase.from('matches').select('user_a,user_b').or(`user_a.eq.${activeUserId},user_b.eq.${activeUserId}`)
    ]);

    const data = profilesResult.data;
    const error = profilesResult.error;
    if (!error && data) {
      const likedIds = new Set((likesResult.data || []).map((row: any) => row.liked_id).filter(Boolean));
      const matchedIds = new Set(
        (matchesResult.data || [])
          .map((row: any) => (row.user_a === activeUserId ? row.user_b : row.user_a))
          .filter(Boolean)
      );
      const excludedIds = new Set<string>([...likedIds, ...matchedIds, activeUserId]);

      const filteredProfiles = data.filter(
        (entry) =>
          !excludedIds.has(entry.id) &&
          Array.isArray(entry.photos) &&
          entry.photos.length > 0 &&
          entry.photo_face_status === 'approved'
      );
      const withPresenceAndDistance = filteredProfiles.map((entry) => {
        const distance =
          myCoordinates && entry.latitude && entry.longitude
            ? calculateDistanceKm(myCoordinates.lat, myCoordinates.lng, entry.latitude, entry.longitude)
            : null;
        const profileCompletionScore = calculateProfileCompletionScore(entry);
        return {
          ...entry,
          is_online: isRecentlyOnline(entry),
          distance_km: distance,
          profile_completion_score: profileCompletionScore
        };
      });
      const ranked = withPresenceAndDistance
        .map((entry) => ({
          ...entry,
          discovery_score: computeDiscoveryScore(profile, entry, entry.distance_km)
        }))
        .sort((a, b) => b.discovery_score - a.discovery_score);

      setUsers(ranked);
      return;
    }
    setUsers([]);
  }, [myCoordinates, profile]);

  useEffect(() => {
    checkUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const setPresence = async (isOnline: boolean) => {
      await supabase.from('profiles').update({ is_online: isOnline, last_seen: new Date().toISOString() }).eq('id', currentUserId);
    };

    setPresence(true);
    const heartbeat = setInterval(() => setPresence(true), 30000);
    const onVisibility = () => setPresence(!document.hidden);
    const onUnload = () => {
      void setPresence(false);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onUnload);
      void setPresence(false);
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    fetchUsers(currentUserId);
    fetchMatches(currentUserId);
    fetchLikedProfiles(currentUserId);
    fetchChatRequests(currentUserId);
    fetchUnreadCounts(currentUserId);
    const timer = setInterval(() => {
      fetchUsers(currentUserId);
      fetchMatches(currentUserId);
      fetchLikedProfiles(currentUserId);
      fetchChatRequests(currentUserId);
      fetchUnreadCounts(currentUserId);
    }, 20000);
    return () => clearInterval(timer);
  }, [currentUserId, fetchUsers, myCoordinates?.lat, myCoordinates?.lng]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data?.session?.user || null;
    setUser(currentUser);

    if (currentUser) {
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();

      if (
        profileData &&
        profileData.age &&
        Array.isArray(profileData.photos) &&
        profileData.photos.length > 0 &&
        profileData.photo_face_status === 'approved'
      ) {
        setProfile(profileData);
        setPhotos(profileData.photos || []);
        setPhotoFaceStatus(profileData.photo_face_status || 'pending');
        setDisplayName(profileData.display_name || '');
        setAge(profileData.age || '');
        setGender(profileData.gender || '');
        setLookingFor(profileData.looking_for || '');
        setMood(profileData.mood || '');
        setBio(profileData.bio || '');
        setLocation(profileData.location_city || profileData.location || '');
        if (profileData.latitude && profileData.longitude) {
          setCoords({ lat: profileData.latitude, lng: profileData.longitude });
        }
        await fetchUsers(currentUser.id);
        await fetchMatches(currentUser.id);
        await fetchLikedProfiles(currentUser.id);
        await fetchUnreadCounts(currentUser.id);
        setCurrentView(VIEW_KEYS.HOME);
      } else {
        if (profileData) {
          setProfile(profileData);
          setPhotos(profileData.photos || []);
          setPhotoFaceStatus(profileData.photo_face_status || 'pending');
          setDisplayName(profileData.display_name || '');
          setAge(profileData.age || '');
          setGender(profileData.gender || '');
          setLookingFor(profileData.looking_for || '');
          setMood(profileData.mood || '');
          setBio(profileData.bio || '');
          setLocation(profileData.location_city || profileData.location || '');
          if (profileData.latitude && profileData.longitude) {
            setCoords({ lat: profileData.latitude, lng: profileData.longitude });
          }
        }
        setCurrentView(VIEW_KEYS.ONBOARDING);
      }
    }

    setLoading(false);
  };

  const fetchMatches = async (userId: string) => {
    const { data: rawMatches, error: rawError } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .eq('status', 'accepted');

    if (rawError || !rawMatches || rawMatches.length === 0) {
      setMatches([]);
      return;
    }

    const profileIds = Array.from(
      new Set(
        rawMatches.map((match) => (match.user_a === userId ? match.user_b : match.user_a)).filter(Boolean)
      )
    );

    const { data: profileRows } = await supabase.from('profiles').select('*').in('id', profileIds);
    const profileMap = new Map((profileRows || []).map((row) => [row.id, row]));

    const dedupedByUser = new Map<string, any>();
    rawMatches.forEach((match) => {
      const otherId = match.user_a === userId ? match.user_b : match.user_a;
      if (!otherId) {
        return;
      }
      const existing = dedupedByUser.get(otherId);
      const existingTs = existing?.created_at ? new Date(existing.created_at).getTime() : 0;
      const currentTs = match?.created_at ? new Date(match.created_at).getTime() : 0;
      if (!existing || currentTs >= existingTs) {
        dedupedByUser.set(otherId, match);
      }
    });

    const fallbackProfiles = Array.from(dedupedByUser.values())
      .map((match) => {
        const otherId = match.user_a === userId ? match.user_b : match.user_a;
        const otherProfile = profileMap.get(otherId);
        if (!otherProfile || otherProfile.is_blocked) {
          return null;
        }
        return {
          ...otherProfile,
          match_id: match.id,
          matched_at: match.updated_at || match.created_at,
          is_online: isRecentlyOnline(otherProfile)
        };
      })
      .filter(Boolean);

    setMatches(fallbackProfiles as any[]);
  };

  const fetchChatRequests = async (userId: string) => {
    const { data: pendingMatches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'pending')
      .eq('user_b', userId);

    if (error || !pendingMatches || pendingMatches.length === 0) {
      setChatRequests([]);
      return;
    }

    const requesterIds = Array.from(new Set(pendingMatches.map((match) => match.user_a).filter(Boolean)));
    const { data: requestProfiles } = await supabase.from('profiles').select('*').in('id', requesterIds);
    const profileMap = new Map((requestProfiles || []).map((profile) => [profile.id, profile]));

    const rows = pendingMatches
      .map((match) => {
        const profile = profileMap.get(match.user_a);
        if (!profile || profile.is_blocked) {
          return null;
        }
        return {
          ...profile,
          match_id: match.id,
          requested_at: match.created_at,
          is_online: isRecentlyOnline(profile)
        };
      })
      .filter(Boolean);

    setChatRequests(rows as any[]);
  };

  const fetchUnreadCounts = async (userId: string) => {
    const { data: matchRows, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`);

    if (matchError || !matchRows || matchRows.length === 0) {
      setUnreadByUser({});
      return;
    }

    const matchIds = matchRows.map((row) => row.id).filter(Boolean);
    if (matchIds.length === 0) {
      setUnreadByUser({});
      return;
    }

    const { data: messageRows, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .in('match_id', matchIds)
      .neq('sender_id', userId);

    if (messagesError || !messageRows) {
      setUnreadByUser({});
      return;
    }

    const counts: Record<string, number> = {};
    messageRows.forEach((message: any) => {
      const hasReadAt = Object.prototype.hasOwnProperty.call(message, 'read_at');
      const hasIsRead = Object.prototype.hasOwnProperty.call(message, 'is_read');
      const isUnread = hasReadAt ? !message.read_at : hasIsRead ? !message.is_read : false;
      if (!isUnread || !message?.sender_id) {
        return;
      }
      counts[message.sender_id] = (counts[message.sender_id] || 0) + 1;
    });
    setUnreadByUser(counts);
  };

  const fetchLikedProfiles = async (userId: string) => {
    const { data: likedRows, error: likesError } = await supabase
      .from('likes')
      .select('liked_id,created_at')
      .eq('liker_id', userId)
      .order('created_at', { ascending: false });

    if (likesError || !likedRows || likedRows.length === 0) {
      setLikedProfiles([]);
      return;
    }

    const likedIds = Array.from(new Set(likedRows.map((row) => row.liked_id).filter(Boolean)));
    const { data: profileRows } = await supabase.from('profiles').select('*').in('id', likedIds);
    const profileMap = new Map((profileRows || []).map((profile) => [profile.id, profile]));

    const rows = likedRows
      .map((row) => {
        const profile = profileMap.get(row.liked_id);
        if (!profile || profile.is_blocked) {
          return null;
        }
        return {
          ...profile,
          liked_at: row.created_at,
          is_online: isRecentlyOnline(profile)
        };
      })
      .filter(Boolean);

    setLikedProfiles(rows as any[]);
  };

  const handleLike = async (likedUserId: string) => {
    if (!user) {
      return;
    }

    const { error: likeError } = await supabase
      .from('likes')
      .upsert(
        { liker_id: user.id, liked_id: likedUserId },
        { onConflict: 'liker_id,liked_id', ignoreDuplicates: true }
      );

    if (likeError) {
      console.error('Failed to register like:', likeError);
      return;
    }

    const { data } = await supabase.from('likes').select('*').eq('liker_id', likedUserId).eq('liked_id', user.id);

    if (data && data.length > 0) {
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user_a.eq.${user.id},user_b.eq.${likedUserId}),and(user_a.eq.${likedUserId},user_b.eq.${user.id})`)
        .order('created_at', { ascending: false });

      const existingMatch = existingMatches && existingMatches.length > 0 ? existingMatches[0] : null;
      if (existingMatch) {
        if (existingMatch.status !== 'accepted') {
          await supabase.from('matches').update({ status: 'accepted' }).eq('id', existingMatch.id);
        }
      } else {
        const sorted = sortUserPair(user.id, likedUserId);
        const { error: insertError } = await supabase.from('matches').insert({ user_a: sorted[0], user_b: sorted[1], status: 'accepted' });
        if (insertError && insertError.code !== '23505') {
          console.error('Unable to create accepted match:', insertError);
        }
      }

      const matchedProfile = users.find((entry) => entry.id === likedUserId) || null;
      if (matchedProfile) {
        setShowMatchModal(matchedProfile);
      }
      await fetchMatches(user.id);
    }

    // Give immediate feedback in the grid even when no mutual match yet.
    setUsers((prev) => prev.filter((entry) => entry.id !== likedUserId));
    void fetchLikedProfiles(user.id);
  };

  const openDirectChat = async (targetUser: any) => {
    if (!user || !targetUser?.id) {
      return;
    }

    setSelectedVideoRoom(null);

    const { data: existingMatches } = await supabase
      .from('matches')
      .select('*')
      .or(`and(user_a.eq.${user.id},user_b.eq.${targetUser.id}),and(user_a.eq.${targetUser.id},user_b.eq.${user.id})`)
      .order('created_at', { ascending: false });

    let matchRow = existingMatches && existingMatches.length > 0 ? existingMatches[0] : null;
    if (!matchRow) {
      const sorted = sortUserPair(user.id, targetUser.id);
      const { data: insertedMatch, error } = await supabase
        .from('matches')
        .insert({ user_a: sorted[0], user_b: sorted[1], status: 'pending' })
        .select('*')
        .single();

      if (error && error.code !== '23505') {
        console.error('Unable to create chat request:', error);
        return;
      }

      if (insertedMatch) {
        matchRow = insertedMatch;
      } else {
        const { data: retryMatches } = await supabase
          .from('matches')
          .select('*')
          .or(`and(user_a.eq.${user.id},user_b.eq.${targetUser.id}),and(user_a.eq.${targetUser.id},user_b.eq.${user.id})`)
          .order('created_at', { ascending: false });
        matchRow = retryMatches && retryMatches.length > 0 ? retryMatches[0] : null;
      }
    }

    if (!matchRow) {
      console.error('Unable to find or create chat request for users:', user.id, targetUser.id);
      return;
    }

    setSelectedMatch({
      ...targetUser,
      match_id: matchRow.id,
      is_online: isRecentlyOnline(targetUser)
    });
    setCurrentView(VIEW_KEYS.INBOX);
  };

  const startDirectVideoCall = async (targetUser: any) => {
    if (!user || !targetUser?.id) {
      return;
    }

    try {
      const session = await ensureDirectCallRoom({
        currentUserId: user.id,
        currentUserName: profile?.display_name || user.email?.split('@')[0] || 'You',
        targetUserId: targetUser.id,
        targetUserName: targetUser.display_name || targetUser.email?.split('@')[0] || 'Match'
      });

      setSelectedVideoRoom({
        ...session,
        targetProfile: targetUser
      });
    } catch (error: any) {
      alert(error?.message || 'Unable to start the video call right now.');
    }
  };

  const uploadPhoto = async (file: File | undefined) => {
    if (!file || !user) {
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setMessage('');

    try {
      const validation = await validateProfilePhotoFace(file);

      if (!validation.hasFace) {
        setPhotos([]);
        setPhotoFaceStatus('flagged');
        await supabase
          .from('profiles')
          .update({
            photos: [],
            photo_face_status: 'flagged',
            photo_face_count: 0,
            photo_face_confidence: null,
            photo_face_checked_at: new Date().toISOString(),
            photo_face_review_note: 'No detectable face found in uploaded profile photo.'
          })
          .eq('id', user.id);
        setProfile((prev: any) =>
          prev
            ? {
                ...prev,
                photos: [],
                photo_face_status: 'flagged',
                photo_face_count: 0,
                photo_face_confidence: null,
                photo_face_checked_at: new Date().toISOString(),
                photo_face_review_note: 'No detectable face found in uploaded profile photo.'
              }
            : prev
        );
        setUploadStatus('error');
        setMessage('Upload a clear face photo. Photos without a detectable face are not allowed.');
        return;
      }

      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from('profile-photos').upload(fileName, file, { upsert: true });

      if (error) {
        setUploadStatus('error');
        setMessage(`Photo upload failed: ${error.message}`);
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

      const nextPhotos = [publicUrl];
      setPhotos(nextPhotos);
      setPhotoFaceStatus('approved');

      await supabase
        .from('profiles')
        .update({
          photos: nextPhotos,
          photo_face_status: 'approved',
          photo_face_count: validation.faceCount,
          photo_face_confidence: validation.confidence,
          photo_face_checked_at: new Date().toISOString(),
          photo_face_review_note: 'Automatic face detection passed.'
        })
        .eq('id', user.id);

      setProfile((prev: any) =>
        prev
          ? {
              ...prev,
              photos: nextPhotos,
              photo_face_status: 'approved',
              photo_face_count: validation.faceCount,
              photo_face_confidence: validation.confidence,
              photo_face_checked_at: new Date().toISOString(),
              photo_face_review_note: 'Automatic face detection passed.'
            }
          : prev
      );
      setUploadStatus('success');
      setMessage('Photo uploaded and face check passed.');
    } catch (error: any) {
      setUploadStatus('error');
      setMessage(error?.message || 'Photo validation failed. Please try a different image.');
    } finally {
      setUploading(false);
    }
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation || !user) {
      setMessage('Geolocation is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCoords(nextCoords);
        await supabase
          .from('profiles')
          .update({
            latitude: nextCoords.lat,
            longitude: nextCoords.lng,
            last_seen: new Date().toISOString()
          })
          .eq('id', user.id);
        setMessage('Location updated. Distance matching is now enabled.');
      },
      () => {
        setMessage('Unable to access your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const completeOnboarding = async () => {
    if (!user) {
      return;
    }

    const mandatoryMissing: string[] = [];
    if (!displayName.trim()) mandatoryMissing.push('display name');
    if (!age || Number.parseInt(age, 10) < 18) mandatoryMissing.push('valid age');
    if (!gender) mandatoryMissing.push('gender');
    if (!lookingFor) mandatoryMissing.push('looking for');
    if (!mood) mandatoryMissing.push('mood');
    if (!bio || bio.trim().length < 20) mandatoryMissing.push('bio (20+ chars)');
    if (!location.trim()) mandatoryMissing.push('location');
    if (!photos || photos.length === 0) mandatoryMissing.push('at least 1 photo');
    if (photoFaceStatus !== 'approved') mandatoryMissing.push('a clear face photo');

    if (mandatoryMissing.length > 0) {
      setMessage(`Complete required fields: ${mandatoryMissing.join(', ')}`);
      return;
    }

    const payload: any = {
      display_name: displayName,
      age: parseInt(age, 10),
      gender,
      looking_for: lookingFor,
      mood,
      bio,
      location_city: location,
      photos,
      photo_face_status: photoFaceStatus
    };

    if (coords) {
      payload.latitude = coords.lat;
      payload.longitude = coords.lng;
    }

    const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);

    if (!error) {
      await checkUser();
    }
  };

  const handleLogout = async () => {
    if (user) {
      await supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSelectedVideoRoom(null);
    setCurrentView(VIEW_KEYS.LANDING);
  };

  const navigateTo = (view: string) => {
    setCurrentView(view);
  };

  useEffect(() => {
    const titleByView: Record<string, string> = {
      [VIEW_KEYS.LANDING]: 'Flame Connect - Meet Real Singles Near You',
      [VIEW_KEYS.HOME]: 'Home - Flame Connect',
      [VIEW_KEYS.PEOPLE]: 'Discover People - Flame Connect',
      [VIEW_KEYS.INBOX]: 'Inbox - Flame Connect',
      [VIEW_KEYS.PROFILE]: 'Your Profile - Flame Connect',
      [VIEW_KEYS.COACHING]: 'VIP Coaching - Flame Connect'
    };
    document.title = titleByView[currentView] || 'Flame Connect';

    const description =
      currentView === VIEW_KEYS.PEOPLE
        ? 'Discover nearby singles, match by mood and intent, and start real conversations on Flame Connect.'
        : currentView === VIEW_KEYS.COACHING
          ? 'Request VIP coaching, dating tips, and profile guidance from the Flame Connect coaching team.'
        : 'Flame Connect helps you discover singles, match by intent, and chat in real time.';
    let tag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [currentView]);

  const mainNav = (activeView: string) => [
    { key: VIEW_KEYS.HOME, label: 'Home', active: activeView === VIEW_KEYS.HOME, onClick: () => setCurrentView(VIEW_KEYS.HOME) },
    { key: VIEW_KEYS.PEOPLE, label: 'People', active: activeView === VIEW_KEYS.PEOPLE, onClick: () => setCurrentView(VIEW_KEYS.PEOPLE) },
    {
      key: VIEW_KEYS.INBOX,
      label: 'Inbox',
      badge: chatRequests.length + Object.values(unreadByUser).reduce((sum, value) => sum + value, 0),
      active: activeView === VIEW_KEYS.INBOX,
      onClick: () => setCurrentView(VIEW_KEYS.INBOX)
    },
    { key: VIEW_KEYS.PROFILE, label: 'Profile', active: activeView === VIEW_KEYS.PROFILE, onClick: () => setCurrentView(VIEW_KEYS.PROFILE) }
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  const dockEligibleViews = [VIEW_KEYS.HOME, VIEW_KEYS.PEOPLE, VIEW_KEYS.INBOX, VIEW_KEYS.PROFILE, VIEW_KEYS.SETTINGS, VIEW_KEYS.NOTIFICATIONS, VIEW_KEYS.EXPLORE, VIEW_KEYS.HELP, VIEW_KEYS.COACHING, VIEW_KEYS.TERMS, VIEW_KEYS.PRIVACY, VIEW_KEYS.UPGRADE];
  const shouldShowFloatingDock = !!user && dockEligibleViews.includes(currentView as any) && !(currentView === VIEW_KEYS.INBOX && !!selectedMatch);

  const wrapWithDock = (content: React.ReactNode) => (
    <>
      {content}
      {shouldShowFloatingDock && (
        <FloatingChatDock
          onlineUsers={users.filter((entry) => entry.is_online)}
          chatRequests={chatRequests}
          ongoingChats={matches}
          onOpenChat={openDirectChat}
        />
      )}
    </>
  );

  if (showMatchModal) {
    return (
      <>
        {currentView === VIEW_KEYS.PEOPLE && <PeopleGrid users={users} onLike={handleLike} onSelectProfile={() => {}} />}
        <MatchPage
          match={showMatchModal}
          onSendMessage={() => {
            setShowMatchModal(null);
            setCurrentView(VIEW_KEYS.INBOX);
          }}
          onKeepSwiping={() => setShowMatchModal(null)}
        />
      </>
    );
  }

  switch (currentView) {
    case VIEW_KEYS.LANDING:
      return <LandingPage onLoginClick={() => setCurrentView(VIEW_KEYS.LOGIN)} onSignupClick={() => setCurrentView(VIEW_KEYS.SIGNUP)} onNavigate={navigateTo} />;
    case VIEW_KEYS.LOGIN:
      return <LoginPage onLogin={() => checkUser()} onSwitchToSignup={() => setCurrentView(VIEW_KEYS.SIGNUP)} />;
    case VIEW_KEYS.SIGNUP:
      return <SignupPage onSwitchToLogin={() => setCurrentView(VIEW_KEYS.LOGIN)} />;
    case VIEW_KEYS.ONBOARDING:
      return (
        <Onboarding
          displayName={displayName}
          setDisplayName={setDisplayName}
          age={age}
          setAge={setAge}
          gender={gender}
          setGender={setGender}
          lookingFor={lookingFor}
          setLookingFor={setLookingFor}
          mood={mood}
          setMood={setMood}
          location={location}
          setLocation={setLocation}
          bio={bio}
          setBio={setBio}
          photos={photos}
          photoFaceStatus={photoFaceStatus}
          uploading={uploading}
          onPhotoUpload={(event) => uploadPhoto(event.target.files?.[0])}
          onUseCurrentLocation={useCurrentLocation}
          onComplete={completeOnboarding}
          message={message}
        />
      );
    case VIEW_KEYS.HOME:
      return wrapWithDock(
        <AppShell
          navActions={mainNav(VIEW_KEYS.HOME)}
          subtitle="Your dating dashboard"
          onBrandClick={() => setCurrentView(VIEW_KEYS.HOME)}
        >
          <HomeDashboard
            profile={profile}
            matches={matches}
            chatRequests={chatRequests}
            users={users}
            onOpenInbox={() => setCurrentView(VIEW_KEYS.INBOX)}
            onOpenPeople={() => setCurrentView(VIEW_KEYS.PEOPLE)}
            onStartVideoCall={startDirectVideoCall}
            onOpenCoaching={() => setCurrentView(VIEW_KEYS.COACHING)}
          />
        </AppShell>
      );
    case VIEW_KEYS.PEOPLE:
      return wrapWithDock(
        <AppShell
          navActions={mainNav(VIEW_KEYS.PEOPLE)}
          subtitle="Discover singles curated for your preferences"
          onBrandClick={() => setCurrentView(VIEW_KEYS.HOME)}
        >
          <PeopleHub users={users} matches={matches} chatRequests={chatRequests} onOpenChat={openDirectChat} onLike={handleLike} onSelectProfile={() => {}} />
        </AppShell>
      );
    case VIEW_KEYS.INBOX:
      return wrapWithDock(
        <AppShell
          navActions={mainNav(VIEW_KEYS.INBOX)}
          maxWidth="780px"
          subtitle="Reply quickly and keep your matches warm"
          hideMobileNav={!!selectedMatch || !!selectedVideoRoom}
          onBrandClick={() => setCurrentView(VIEW_KEYS.HOME)}
        >
          <section style={{ marginBottom: '14px', background: '#fff', border: '1px solid #e8ebf3', borderRadius: '16px', padding: '14px 16px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1f2230' }}>Your Conversations</h2>
            <p style={{ margin: 0, color: '#6b7288', fontSize: '14px' }}>Open a chat and keep the momentum going.</p>
          </section>
          {selectedVideoRoom ? (
            <Suspense
              fallback={
                <div style={{ border: '1px solid #e8ebf3', borderRadius: '18px', background: '#fff', padding: '28px', textAlign: 'center', color: '#6f7690' }}>
                  Loading video room...
                </div>
              }
            >
              <VideoRoomPage
                roomName={selectedVideoRoom.roomName}
                roomTitle={selectedVideoRoom.title}
                requestedRole={selectedVideoRoom.requestedRole}
                currentUser={user}
                targetProfile={selectedVideoRoom.targetProfile}
                onBack={() => setSelectedVideoRoom(null)}
              />
            </Suspense>
          ) : selectedMatch ? (
            <ChatPage match={selectedMatch} currentUser={user} onBack={() => setSelectedMatch(null)} onStartVideoCall={() => startDirectVideoCall(selectedMatch)} />
          ) : (
            <Inbox
              matches={matches}
              chatRequests={chatRequests}
              likedProfiles={likedProfiles}
              unreadByUser={unreadByUser}
              onBrowsePeople={() => setCurrentView(VIEW_KEYS.PEOPLE)}
              onSelectMatch={setSelectedMatch}
              onOpenRequest={openDirectChat}
              onOpenLikedProfile={openDirectChat}
            />
          )}
        </AppShell>
      );
    case VIEW_KEYS.PROFILE:
      return wrapWithDock(
        <AppShell
          navActions={mainNav(VIEW_KEYS.PROFILE)}
          maxWidth="620px"
          subtitle="Manage your profile and matching preferences"
          onBrandClick={() => setCurrentView(VIEW_KEYS.HOME)}
        >
          <Profile
            profile={{ ...(profile || {}), upload_message: message, upload_status: uploadStatus }}
            user={user}
            photos={photos}
            onEditProfile={() => setCurrentView(VIEW_KEYS.ONBOARDING)}
            onLogout={handleLogout}
            onPhotoChange={(event) => uploadPhoto(event.target.files?.[0])}
          />
        </AppShell>
      );
    case VIEW_KEYS.SETTINGS:
      return wrapWithDock(<SettingsPage user={user} onBack={() => setCurrentView(VIEW_KEYS.PROFILE)} />);
    case VIEW_KEYS.NOTIFICATIONS:
      return wrapWithDock(<NotificationsPage user={user} onBack={() => setCurrentView(VIEW_KEYS.PEOPLE)} onNavigate={navigateTo} />);
    case VIEW_KEYS.EXPLORE:
      return wrapWithDock(<ExplorePage user={user} onBack={() => setCurrentView(VIEW_KEYS.PEOPLE)} onSelectProfile={() => {}} />);
    case VIEW_KEYS.HELP:
      return wrapWithDock(<HelpPage onBack={() => setCurrentView(VIEW_KEYS.LANDING)} />);
    case VIEW_KEYS.COACHING:
      return wrapWithDock(<CoachingPage user={user} profile={profile} onBack={() => setCurrentView(user ? VIEW_KEYS.HOME : VIEW_KEYS.LANDING)} onNavigate={navigateTo} />);
    case VIEW_KEYS.TERMS:
      return wrapWithDock(<TermsPage onBack={() => setCurrentView(VIEW_KEYS.LANDING)} />);
    case VIEW_KEYS.PRIVACY:
      return wrapWithDock(<PrivacyPage onBack={() => setCurrentView(VIEW_KEYS.LANDING)} />);
    case VIEW_KEYS.UPGRADE:
      return wrapWithDock(<UpgradePage onBack={() => setCurrentView(VIEW_KEYS.PROFILE)} />);
    default:
      return <NotFoundPage onNavigate={navigateTo} />;
  }
}

export default App;
