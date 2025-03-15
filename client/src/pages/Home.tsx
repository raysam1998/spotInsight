import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="home">
      <h1>Welcome to SpotInsight</h1>
      <p>Your Spotify analytics and playlist modifier app</p>
      <Link to="/login">Login with Spotify</Link>
    </div>
  );
};

export default Home;
