import React from 'react';

const Login: React.FC = () => {
  const handleLogin = () => {
    // Will implement Spotify OAuth login
    window.location.href = '/api/auth/spotify';
  };

  return (
    <div className="login">
      <h1>Login to SpotInsight</h1>
      <button onClick={handleLogin}>Connect with Spotify</button>
    </div>
  );
};

export default Login;
