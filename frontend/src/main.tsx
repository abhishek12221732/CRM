// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
  console.error('VITE_GOOGLE_CLIENT_ID is not defined in .env. Please check your .env file.');
  // You might want to render an error message to the user or stop the app from loading
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
    <BrowserRouter> {/* Wrap your App component with BrowserRouter */}
      <App />
    </BrowserRouter>
    </GoogleOAuthProvider>
    ) : (
      // Display an error if the client ID is missing
      <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>
        <h1>Configuration Error</h1>
        <p>Google Client ID is missing. Please ensure VITE_GOOGLE_CLIENT_ID is set in your .env file.</p>
        <p>Refer to the backend/frontend setup instructions for details.</p>
      </div>
    )}
  </React.StrictMode>,
);