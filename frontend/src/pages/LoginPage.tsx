// --- frontend/src/pages/LoginPage.tsx ---
import React, { useState } from 'react';
// Removed Chrome icon as it's not used. If you want a generic brand icon, consider one from Lucide.
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react'; // Using a different icon for branding

interface LoginPageProps {
  onLoginSuccess: (userData: { name: string; email: string; photoURL?: string }) => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleCredentialResponse = async (response: CredentialResponse) => {
    setLoginError(null);
    if (response.credential) {
      try {
        const backendResponse = await axios.post(`${BACKEND_URL}/api/auth/google-auth`, {
          id_token: response.credential,
        });

        if (backendResponse.data?.token) {
          localStorage.setItem('token', backendResponse.data.token);
          // Fetch user details from the backend after successful token exchange
          // This ensures user data is sourced from your trusted backend.
          try {
            const userResponse = await axios.get(`${BACKEND_URL}/api/auth/verify`, { // Assuming /verify returns user data
              headers: {
                Authorization: `Bearer ${backendResponse.data.token}`
              }
            });

            const userData = {
              name: userResponse.data.user.name,
              email: userResponse.data.user.email,
              photoURL: userResponse.data.user.picture,
            };
            onLoginSuccess(userData);

          } catch (verifyError) {
            console.error('Session verification failed:', verifyError);
            localStorage.removeItem('token');
            setLoginError('Failed to verify session. Please try again.');
          }
        } else {
          setLoginError(backendResponse.data?.message || 'Authentication failed - no token received from backend.');
        }
      } catch (error: any) {
        console.error('Login error during backend token exchange:', error);
        setLoginError(error.response?.data?.message || 'Login failed due to a server error.');
      }
    } else {
      setLoginError('No credential received from Google. Please try again.');
    }
  };

  const handleGoogleLoginError = () => {
    setLoginError('Google login process failed. Please check your internet connection or browser settings and try again.');
  };

  return (
    // Using a slightly softer gradient and ensuring text contrast
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 p-4">
      <div className="w-full max-w-md p-8 md:p-10 space-y-8 bg-white rounded-xl shadow-2xl text-center">
        <div className="flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-sky-600 mb-4" /> {/* Modern Icon */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Welcome to Mini CRM</h1>
          <p className="mt-2 text-slate-600">Securely sign in with your Google account.</p>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleCredentialResponse}
            onError={handleGoogleLoginError}
            useOneTap
            theme="filled_blue" // Explicitly using a standard theme
            shape="rectangular" // Consistent button shape
            width="300px" // Fixed width for consistency
          />
        </div>

        {loginError && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-medium">Login Error</p>
            <p className="text-sm">{loginError}</p>
          </div>
        )}

        <p className="text-xs text-slate-500 pt-4 border-t border-slate-200">
          Built for Xeno SDE Internship Assignment.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;