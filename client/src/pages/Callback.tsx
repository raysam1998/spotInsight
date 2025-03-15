import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Will handle the Spotify OAuth callback
    const handleCallback = async () => {
      // Process authentication
      navigate('/dashboard');
    };
    
    handleCallback();
  }, [navigate]);

  return <div>Authenticating...</div>;
};

export default Callback;
