import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ExplorePage({ user, onBack, onSelectProfile }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 60,
    gender: '',
    lookingFor: '',
    distance: 50
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .limit(100);
    if (data) {
      setUsers(data);
      setFilteredUsers(data);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...users];
    
    // Age filter
    filtered = filtered.filter(u => u.age >= filters.ageMin && u.age <= filters.ageMax);
    
    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(u => u.gender === filters.gender);
    }
    
    // Looking for filter
    if (filters.lookingFor) {
      filtered = filtered.filter(u => u.looking_for === filters.lookingFor);
    }
    
    setFilteredUsers(filtered);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '20px' }}>←</button>
          <h1 style={{ margin: 0, color: '#ff6b6b' }}>Explore</h1>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>
          🔍 Filters {showFilters ? '▲' : '▼'}
        </button>
      </div>
      
      {showFilters && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
          <h3>Filter Matches</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label>Age Range</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" value={filters.ageMin} onChange={(e) => setFilters({...filters, ageMin: parseInt(e.target.value)})} style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
                <span>to</span>
                <input type="number" value={filters.ageMax} onChange={(e) => setFilters({...filters, ageMax: parseInt(e.target.value)})} style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div>
              <label>Gender</label>
              <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label>Looking for</label>
              <select value={filters.lookingFor} onChange={(e) => setFilters({...filters, lookingFor: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">Any</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
          </div>
          <button onClick={() => setFilters({ ageMin: 18, ageMax: 60, gender: '', lookingFor: '', distance: 50 })} style={{ marginTop: '15px', padding: '8px 20px', background: '#ccc', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>Reset Filters</button>
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <h2>No matches found</h2>
          <p>Try adjusting your filters to see more people</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {filteredUsers.map(u => (
            <div key={u.id} onClick={() => onSelectProfile(u)} style={{ cursor: 'pointer', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              {u.photos && u.photos.length > 0 ? (
                <img src={u.photos[0]} alt={u.display_name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '250px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📷</div>
              )}
              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0 }}>{u.display_name || u.email?.split('@')[0]}, {u.age || '?'}</h3>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: u.is_online ? '#4CAF50' : '#999' }}></span>
                </div>
                <p style={{ color: '#666', fontSize: '14px' }}>📍 {u.location_city || 'Unknown'}</p>
                <p style={{ fontSize: '13px', color: '#666' }}>{u.bio?.substring(0, 80)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
