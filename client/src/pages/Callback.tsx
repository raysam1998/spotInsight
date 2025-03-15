import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('Callback component mounted with URL:', window.location.href);
      
      const params = new URLSearchParams(location.search);
      const success = params.get('success');
      const errorParam = params.get('error');
      const errorMessage = params.get('message');
      
      console.log('Auth parameters:', { success, errorParam, errorMessage });
      
      if (errorParam) {
        const fullError = errorMessage ? `${errorParam}: ${errorMessage}` : errorParam;
        setError(`Authentication failed: ${fullError}`);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }
      
      if (success === 'true') {
        console.log('Success detected, attempting to fetch user profile');
        try {
          // Attempt to get user profile to verify authentication worked
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/spotify/me`, {
            credentials: 'include' // Important for cookies
          });
          
          if (response.ok) {
            const user = await response.json();
            console.log('User profile retrieved successfully:', user.display_name);
            navigate('/dashboard');
          } else {
            const error = await response.json();
            setError(`Failed to get user profile: ${error.error || 'Unknown error'}`);
            setTimeout(() => navigate('/login'), 3000);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError('Failed to verify authentication');
          setTimeout(() => navigate('/login'), 3000);
        }
        return;
      }
      
      // If we reach here, no success or error parameters were found
      setError('No authentication response received');
      setTimeout(() => navigate('/login'), 3000);
    };
    
    checkAuthStatus();
  }, [location, navigate]);
  
  return (
    <div className='callback-page'>
      {error ? (
        <div className='error-container'>
          <h2>Auth Error</h2>
          <p>{error}</p>
          <p>Redirecting you back to login...</p>
        </div>
      ) : (
        <div className='loading-container'>
          <h2>Authenticating with Spotify, please wait 😁</h2>
          <p>Processing your authentication...</p>
        </div>
      )}
    </div>
  );
};

export default Callback;