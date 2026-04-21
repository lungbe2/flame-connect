import React, { useState } from 'react';

export default function ExplorePage({ onBack }) {
  const [filters, setFilters] = useState({ ageMin: 18, ageMax: 60, gender: '' });
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '8px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '5px' }}>← Back</button>
        <h1 style={{ color: '#ff6b6b' }}>Explore</h1>
        <button onClick={() => setShowFilters(!showFilters)} style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer' }}>🔍 Filters</button>
      </div>
      
      {showFilters && (
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
          <h3>Filter Matches</h3>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <label>Age Range</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" value={filters.ageMin} onChange={(e) => setFilters({...filters, ageMin: e.target.value})} style={{ width: '70px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
                <span>to</span>
                <input type="number" value={filters.ageMax} onChange={(e) => setFilters({...filters, ageMax: e.target.value})} style={{ width: '70px', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <div>
              <label>Gender</label>
              <select value={filters.gender} onChange={(e) => setFilters({...filters, gender: e.target.value})} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
        <h2>Find Your Match</h2>
        <p>Use filters to discover people who match your preferences</p>
      </div>
    </div>
  );
}
