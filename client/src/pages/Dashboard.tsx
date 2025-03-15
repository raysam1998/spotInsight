import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Make sure path is correct

const Dashboard: React.FC = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className='loading'>Loading your Spotify data...</div>;
  }
  
  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="dashboard">
      <header className='dashboard-header'>
          <h1>Welcome to SpotInsight, {user.display_name}!</h1>
          <button onClick={logout} className='logout-button'>Logout</button>
      </header>

      <div className="user-profile">
        <div className="profile-header">
          <div className="profile-image">
            {user.images && user.images.length > 0 ? (
              <img src={user.images[0].url} alt={user.display_name} />
            ) : (
              <div className="profile-image-placeholder">
                {user.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h2>{user.display_name}</h2>
            <p>{user.email}</p>
            <p>Country: {user.country}</p>
            <p>Account Type: {user.product}</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="section">
          <h3>Your Playlists</h3>
          <p className="placeholder-message">Playlist data will be loaded here</p>
        </div>
        
        <div className="section">
          <h3>Recent Listening Activity</h3>
          <p className="placeholder-message">Your recent activity will appear here</p>
        </div>
        
        <div className="section">
          <h3>Top Artists</h3>
          <p className="placeholder-message">Your top artists will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;