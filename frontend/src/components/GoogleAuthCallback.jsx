import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { setAuthToken } from '../api/client';
import { Loader2 } from 'lucide-react';

const GoogleAuthCallback = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          console.error('Google OAuth error:', error);
          setError(`Google authentication failed: ${error}`);
          setIsProcessing(false);
          return;
        }

        if (!code) {
          setError('No authorization code received from Google');
          setIsProcessing(false);
          return;
        }

        console.log('Received Google OAuth code, exchanging for tokens...');

        // Exchange the authorization code for tokens and user info
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error response:', errorData);
          throw new Error(errorData.error || 'Failed to authenticate with Google');
        }

        const data = await response.json();
        console.log('Google authentication successful:', data);

        // Store the token
        setAuthToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Call the onLogin callback
        onLogin(data.user);

        // Redirect to dashboard
        navigate('/dashboard');

      } catch (err) {
        console.error('Google callback error:', err);
        
        // If it's an invalid_grant error, redirect back to login
        if (err.message.includes('expired') || err.message.includes('already used')) {
          setError('Authentication session expired. Please try signing in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(err.message || 'Failed to complete Google authentication');
        }
        
        setIsProcessing(false);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, onLogin]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Authentication Failed</h2>
            <p className="text-white/80 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary w-full"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-400 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Completing Sign In</h2>
          <p className="text-white/80">Please wait while we complete your Google authentication...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback; 