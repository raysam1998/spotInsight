// client/src/pages/Login.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login, isLoading, error: authError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLocalError(null);
      await login();
      // The login function will redirect to Spotify,
      // so we don't need to navigate here
    } catch (err) {
      setLocalError('Failed to connect with Spotify. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login to SpotInsight</h1>
        <p>Connect with your Spotify account to analyze your music taste and modify playlists</p>
        
        {(localError || authError) && (
          <div className="error-message">
            {localError || authError}
          </div>
        )}
        
        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="spotify-login-button"
        >
          {isLoading ? 'Connecting...' : 'Connect with Spotify'}
        </button>
      </div>
    </div>
  );
};

export default Login;