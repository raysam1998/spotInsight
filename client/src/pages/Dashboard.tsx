import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Will fetch user data and playlists
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading your Spotify data...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Your SpotInsight Dashboard</h1>
      <p>Here you'll see your analytics and playlists</p>
    </div>
  );
};

export default Dashboard;
