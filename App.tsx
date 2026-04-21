import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Onboarding from './components/Onboarding';
import PeopleGrid from './components/PeopleGrid';
import Inbox from './components/Inbox';
import Profile from './components/Profile';
import ChatPage from './pages/ChatPage';
import MatchPage from './pages/MatchPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ExplorePage from './pages/ExplorePage';
import HelpPage from './pages/HelpPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPage from './pages/AdminPage';
import UpgradePage from './pages/UpgradePage';
import LandingPage from './components/LandingPage';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentView, setCurrentView] = useState('landing');
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    const currentUser = data?.session?.user || null;
    setUser(currentUser);
    
    if (currentUser) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      
      if (profileData && profileData.age) {
        setProfile(profileData);
        setPhotos(profileData.photos || []);
        setDisplayName(profileData.display_name || '');
        setAge(profileData.age || '');
        setGender(profileData.gender || '');
        setLookingFor(profileData.looking_for || '');
        setBio(profileData.bio || '');
        setLocation(profileData.location_city || '');
        await fetchUsers();
        await fetchMatches(currentUser.id);
        setCurrentView('people');
      } else {
        setShowOnboarding(true);
        setCurrentView('onboarding');
      }
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user?.id)
      .order('is_online', { ascending: false });
    if (data) setUsers(data);
  };

  const fetchMatches = async (userId) => {
    const { data } = await supabase
      .from('matches')
      .select('*, profiles!matches_user_a_fkey(*), profiles!matches_user_b_fkey(*)')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .eq('status', 'accepted');
    
    if (data) {
      const matchProfiles = data.map(match => ({
        ...(match.user_a === userId ? match.profiles_user_b_fkey : match.profiles_user_a_fkey),
        match_id: match.id
      }));
      setMatches(matchProfiles);
    }
  };

  const handleLike = async (likedUserId) => {
    await supabase.from('likes').insert({ liker_id: user.id, liked_id: likedUserId });
    
    const { data } = await supabase
      .from('likes')
      .select('*')
      .eq('liker_id', likedUserId)
      .eq('liked_id', user.id);
    
    if (data && data.length > 0) {
      const { data: newMatch } = await supabase
        .from('matches')
        .insert({ user_a: user.id, user_b: likedUserId, status: 'accepted' })
        .select('*, profiles!matches_user_a_fkey(*), profiles!matches_user_b_fkey(*)')
        .single();
      
      const matchedProfile = newMatch.user_a === user.id ? newMatch.profiles_user_b_fkey : newMatch.profiles_user_a_fkey;
      setShowMatchModal(matchedProfile);
      await fetchMatches(user.id);
    }
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('profile-photos').upload(fileName, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
      setPhotos([publicUrl]);
      setMessage('Photo uploaded!');
    }
    setUploading(false);
  };

  const completeOnboarding = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        age: parseInt(age),
        gender,
        looking_for: lookingFor,
        bio,
        location_city: location,
        photos
      })
      .eq('id', user.id);
    
    if (!error) {
      setShowOnboarding(false);
      await checkUser();
    }
  };

  const handleLogout = async () => {
    if (user) {
      await supabase.from('profiles').update({ is_online: false }).eq('id', user.id);
    }
    await supabase.auth.signOut();
    setUser(null);
    setCurrentView('landing');
  };

  const navigateTo = (view, data = null) => {
    if (data) {
      if (view === 'chat') setSelectedMatch(matches.find(m => m.id === data));
      if (view === 'profile') setSelectedProfile(data);
    }
    setCurrentView(view);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  if (showMatchModal) {
    return (
      <>
        {currentView === 'people' && <PeopleGrid users={users} onLike={handleLike} onSelectProfile={() => {}} />}
        <MatchPage 
          match={showMatchModal} 
          onSendMessage={() => {
            setShowMatchModal(null);
            setCurrentView('inbox');
          }}
          onKeepSwiping={() => setShowMatchModal(null)}
        />
      </>
    );
  }

  switch (currentView) {
    case 'landing':
      return <LandingPage onLoginClick={() => setCurrentView('login')} onSignupClick={() => setCurrentView('signup')} onNavigate={navigateTo} />;
    case 'login':
      return <LoginPage onLogin={() => checkUser()} onSwitchToSignup={() => setCurrentView('signup')} />;
    case 'signup':
      return <SignupPage onSwitchToLogin={() => setCurrentView('login')} />;
    case 'onboarding':
      return <Onboarding 
        displayName={displayName} setDisplayName={setDisplayName}
        age={age} setAge={setAge}
        gender={gender} setGender={setGender}
        lookingFor={lookingFor} setLookingFor={setLookingFor}
        location={location} setLocation={setLocation}
        bio={bio} setBio={setBio}
        photos={photos} uploading={uploading}
        onPhotoUpload={(e) => uploadPhoto(e.target.files[0])}
        onComplete={completeOnboarding}
        message={message}
      />;
    case 'people':
      return (
        <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setCurrentView('people')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👥 People</button>
              <button onClick={() => setCurrentView('inbox')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>💬 Inbox</button>
              <button onClick={() => setCurrentView('profile')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👤 Profile</button>
              <button onClick={() => setCurrentView('notifications')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>🔔</button>
              <button onClick={() => setCurrentView('settings')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>⚙️</button>
            </div>
          </div>
          <PeopleGrid users={users} onLike={handleLike} onSelectProfile={(p) => setSelectedProfile(p)} />
        </div>
      );
    case 'inbox':
      return (
        <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setCurrentView('people')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👥 People</button>
              <button onClick={() => setCurrentView('inbox')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>💬 Inbox</button>
              <button onClick={() => setCurrentView('profile')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👤 Profile</button>
            </div>
          </div>
          <h2>Your Conversations</h2>
          {selectedMatch ? (
            <ChatPage match={selectedMatch} currentUser={user} onBack={() => setSelectedMatch(null)} />
          ) : (
            <Inbox matches={matches} onBrowsePeople={() => setCurrentView('people')} onSelectMatch={setSelectedMatch} />
          )}
        </div>
      );
    case 'profile':
      return (
        <div style={{ maxWidth: '500px', margin: '20px auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#ff6b6b' }}>🔥 Flame Connect</h1>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={() => setCurrentView('people')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👥 People</button>
              <button onClick={() => setCurrentView('inbox')} style={{ background: 'none', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>💬 Inbox</button>
              <button onClick={() => setCurrentView('profile')} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer' }}>👤 Profile</button>
            </div>
          </div>
          <Profile 
            profile={profile} 
            user={user} 
            photos={photos} 
            onEditProfile={() => setCurrentView('onboarding')}
            onLogout={handleLogout}
            onPhotoChange={(e) => uploadPhoto(e.target.files[0])}
          />
        </div>
      );
    case 'settings':
      return <SettingsPage user={user} onBack={() => setCurrentView('profile')} />;
    case 'notifications':
      return <NotificationsPage user={user} onBack={() => setCurrentView('people')} onNavigate={navigateTo} />;
    case 'explore':
      return <ExplorePage user={user} onBack={() => setCurrentView('people')} onSelectProfile={(p) => setSelectedProfile(p)} />;
    case 'help':
      return <HelpPage onBack={() => setCurrentView('landing')} />;
    case 'terms':
      return <TermsPage onBack={() => setCurrentView('landing')} />;
    case 'privacy':
      return <PrivacyPage onBack={() => setCurrentView('landing')} />;
    case 'upgrade':
      return <UpgradePage onBack={() => setCurrentView('profile')} />;
    case 'admin':
      return <AdminPage user={user} onBack={() => setCurrentView('people')} />;
    default:
      return <NotFoundPage onNavigate={navigateTo} />;
  }
}

export default App;
