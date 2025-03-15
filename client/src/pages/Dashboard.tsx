// client/src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PlaylistsSection from '../components/PlaylistsSection';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    
    h1 {
      margin-bottom: 15px;
    }
  }
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    margin-top: 15px;
  }
`;

const ActionButton = styled.button`
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #19a54a;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
`;

const LogoutButton = styled.button`
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #e53935;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
`;

const UserProfile = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  background-color: #1DB954;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 15px;
  }
`;

const ProfileInfo = styled.div`
  h2 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #191414;
  }
  
  p {
    margin: 5px 0;
    color: #666;
  }
`;

const DashboardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  h3 {
    margin-top: 0;
    color: #191414;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 10px;
  }
`;

const PlaceholderMessage = styled.p`
  color: #888;
  font-style: italic;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.2rem;
  color: #666;
`;

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
    return <LoadingMessage>Loading your Spotify data...</LoadingMessage>;
  }
  
  if (!user) {
    return <div>No user data available</div>;
  }
  
  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  const goToConverter = () => {
    navigate('/converter');
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>Welcome to SpotInsight, {user.display_name}!</h1>
        <HeaderButtons>
          <ActionButton onClick={goToConverter}>
            <span>Convert Playlists</span>
          </ActionButton>
          <LogoutButton onClick={logout}>Logout</LogoutButton>
        </HeaderButtons>
      </DashboardHeader>

      <UserProfile>
        <ProfileHeader>
          <ProfileImage>
            {user.images && user.images.length > 0 ? (
              <img src={user.images[0].url} alt={user.display_name} />
            ) : (
              user.display_name.charAt(0).toUpperCase()
            )}
          </ProfileImage>
          
          <ProfileInfo>
            <h2>{user.display_name}</h2>
            <p>{user.email}</p>
            <p>Country: {user.country}</p>
            <p>Account Type: {user.product}</p>
          </ProfileInfo>
        </ProfileHeader>
      </UserProfile>
      
      <DashboardContent>
        {/* Playlists Section */}
        <Section>
          <PlaylistsSection 
            limit={8}
            showViewAll={true}
            onPlaylistClick={handlePlaylistClick}
          />
        </Section>
        
        {/* Recent Activity Section */}
        <Section>
          <h3>Recent Listening Activity</h3>
          <PlaceholderMessage>Your recent activity will appear here</PlaceholderMessage>
        </Section>
        
        {/* Top Artists Section */}
        <Section>
          <h3>Top Artists</h3>
          <PlaceholderMessage>Your top artists will be displayed here</PlaceholderMessage>
        </Section>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;