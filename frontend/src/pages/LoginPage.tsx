// --- frontend/src/pages/LoginPage.tsx ---
// This file will now handle Google OAuth 2.0 directly.
import React, { useState } from 'react';
import { Chrome } from 'lucide-react'; // Import Chrome icon from lucide-react
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'; // Google OAuth components
import axios from 'axios'; // For making HTTP requests to your backend

interface LoginPageProps {
  onLoginSuccess: (userData: { name: string; email: string; photoURL?: string }) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Get backend URL from environment variables

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loginError, setLoginError] = useState<string | null>(null); // State for displaying login errors

  /**
   * Handles the successful credential response from Google.
   * Sends the ID token to the backend for verification and authentication.
   */
  const handleCredentialResponse = async (response: CredentialResponse) => {
  setLoginError(null);
  if (response.credential) {
    try {
      const backendResponse = await axios.post(`${BACKEND_URL}/api/auth/google-auth`, {
        id_token: response.credential,
      });

      if (backendResponse.data?.token) {
        // Store token
        localStorage.setItem('token', backendResponse.data.token);
        
        // Immediately verify token works
        try {
          const userResponse = await axios.get(`${BACKEND_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${backendResponse.data.token}`
            }
          });
          
          onLoginSuccess({
            name: userResponse.data.user.name,
            email: userResponse.data.user.email,
            photoURL: userResponse.data.user.picture,
          });
          console.log(userResponse.data.user.picture);

        } catch (verifyError) {
          localStorage.removeItem('token');
          setLoginError('Failed to verify session');
        }
      } else {
        setLoginError('Authentication failed - no token received');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(error.response?.data?.message || 'Login failed');
    }
  }
};



  /**
   * Handles errors from the Google Login component itself.
   */
  const handleGoogleLoginError = () => {
    setLoginError('Google login failed. Please ensure you have a stable internet connection and try again.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-sky-800 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl text-center">
        <div>
          <h1 className="text-4xl font-bold text-sky-700">Welcome to Mini CRM</h1>
          <p className="mt-2 text-gray-600">Please sign in to continue.</p>
        </div>

        {/* GoogleLogin component will render the actual Google Sign-In button */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={handleGoogleLoginError}
            useOneTap // Enable Google One Tap for a smoother experience
            // You can customize the button appearance here if needed, e.g., theme="filled_blue"
          />
        </div>

        {loginError && (
          <p className="text-red-600 bg-red-100 border border-red-300 rounded-lg p-3 text-sm">
            {loginError}
          </p>
        )}

        <p className="text-xs text-gray-500">
          Built for Xeno SDE Internship Assignment.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;