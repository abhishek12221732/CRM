// --- frontend/src/App.tsx ---
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import DashboardPage from './pages/DashboardPage';
import AudienceBuilderPage from './pages/AudienceBuilderPage';
import CampaignHistoryPage from './pages/CampaignHistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage'; // Placeholder for login
import type { NavItem } from './types'; // Assuming types.ts exists and defines NavItem

// Import icons from lucide-react
import { LayoutDashboard, Users, MessageSquareText, Settings, LogIn, Bot } from 'lucide-react';

// Define the available pages/routes in the application
type Page = 'dashboard' | 'audience-builder' | 'campaign-history' | 'settings' | 'ai-features' | 'login';

interface UserData {
  name: string;
  email: string;
  photoURL?: string; // Optional profile picture URL
}

// Main App component
const App: React.FC = () => {
  // State to manage the currently active page
  const [currentPage, setCurrentPage] = useState<Page>('login'); // Start at login page
  // State to manage user authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // State for user information
  const [user, setUser] = useState<UserData | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would verify this token with your backend here
      // For now, we'll assume a token means authenticated
      setIsAuthenticated(true);
      // If you store user data in the token or need to fetch it, do it here
      // For this example, we'll rely on LoginPage's success callback for initial user data
      setCurrentPage('dashboard');
    } else {
      setIsAuthenticated(false);
      setCurrentPage('login');
    }
  }, []); // Run only once on component mount

  /**
   * Handles successful login.
   * Updates isAuthenticated state, sets user data, and navigates to dashboard.
   */
  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    setIsAuthenticated(true); // Set authenticated to true
    console.log('Login successful:', userData);
    setCurrentPage('dashboard'); // Redirect to dashboard after successful login
  };

  /**
   * Handles user logout.
   * Clears the user state, removes the authentication token from local storage,
   * sets isAuthenticated to false, and redirects to the login page.
   */
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token'); // Remove the stored token
    setIsAuthenticated(false); // Set authenticated to false
    console.log('Logged out successfully.');
    setCurrentPage('login'); // Redirect to login page after logout
  };

  // Handler for page navigation
  const navigateTo = (page: Page) => {
    if (!isAuthenticated && page !== 'login') {
      setCurrentPage('login'); // Redirect to login if not authenticated and trying to access protected page
    } else {
      setCurrentPage(page);
    }
  };

  // Define navigation items for the sidebar
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { id: 'audience-builder', label: 'Audience Builder', icon: Users, page: 'audience-builder' },
    { id: 'campaign-history', label: 'Campaign History', icon: MessageSquareText, page: 'campaign-history' },
    { id: 'ai-features', label: 'AI Tools', icon: Bot, page: 'ai-features' }, // Placeholder for AI features page
    { id: 'settings', label: 'Settings', icon: Settings, page: 'settings' },
  ];

  // Render the appropriate page based on the current state and authentication status
  const renderPage = () => {
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'audience-builder':
        return <AudienceBuilderPage />;
      case 'campaign-history':
        return <CampaignHistoryPage />;
      case 'ai-features':
        // This would be a new page component for AI features
        return <div className="p-6"><h1 className="text-2xl font-semibold">AI Features</h1><p>Integrate your AI-powered tools here.</p></div>;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />; // Fallback to Dashboard
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      {/* Sidebar and Header are only rendered if authenticated */}
      {isAuthenticated && <Sidebar navItems={navItems} currentPage={currentPage} navigateTo={navigateTo} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
