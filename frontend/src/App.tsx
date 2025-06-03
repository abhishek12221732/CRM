// --- frontend/src/App.tsx ---
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import DashboardPage from './pages/DashboardPage';
import AudienceBuilderPage from './pages/AudienceBuilderPage';
import CampaignHistoryPage from './pages/CampaignHistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import type { NavItem } from './types';

// Import icons from lucide-react
import { LayoutDashboard, Users, MessageSquareText, Settings, Bot } from 'lucide-react'; // LogIn icon is not used here anymore

// Define the available pages/routes in the application
type Page = 'dashboard' | 'audience-builder' | 'campaign-history' | 'settings' | 'ai-features' | 'login';

interface UserData {
  name: string;
  email: string;
  photoURL?: string;
}

// Main App component
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you would verify this token with your backend here
      // For now, we'll assume a token means authenticated
      // Simulating fetching user data based on token (replace with actual API call)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser) as UserData;
            setUser(parsedUser);
            setIsAuthenticated(true);
            setCurrentPage('dashboard');
        } catch (error) {
            console.error("Failed to parse stored user data:", error);
            // Token might be valid but user data corrupted, force re-login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setCurrentPage('login');
        }
      } else {
         // If no user data but token exists, it implies an incomplete previous login or an old token.
         // For simplicity here, we'll treat as logged out. A real app might try to fetch user data.
        localStorage.removeItem('token'); // Clean up potentially stale token
        setIsAuthenticated(false);
        setCurrentPage('login');
      }
    } else {
      setIsAuthenticated(false);
      setCurrentPage('login');
    }
  }, []);

  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData)); // Store user data
    console.log('Login successful:', userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear stored user data
    setIsAuthenticated(false);
    console.log('Logged out successfully.');
    setCurrentPage('login');
  };

  const navigateTo = (page: Page) => {
    if (!isAuthenticated && page !== 'login') {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { id: 'audience-builder', label: 'Audience Builder', icon: Users, page: 'audience-builder' },
    { id: 'campaign-history', label: 'Campaign History', icon: MessageSquareText, page: 'campaign-history' },
    { id: 'ai-features', label: 'AI Tools', icon: Bot, page: 'ai-features' },
    { id: 'settings', label: 'Settings', icon: Settings, page: 'settings' },
  ];

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
        return (
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-semibold text-slate-800 mb-4">AI Features</h1>
            <p className="text-slate-600">Integrate your AI-powered tools and features here. This section is a placeholder for future development.</p>
          </div>
        );
      case 'settings':
        return <SettingsPage />;
      default:
        // Fallback to Dashboard if authenticated but page is unknown
        setCurrentPage('dashboard');
        return <DashboardPage />;
    }
  };

  return (
    // Changed background to a lighter slate for a cleaner look
    <div className="flex h-screen w-screen bg-slate-100 font-inter">
  {isAuthenticated && <Sidebar navItems={navItems} currentPage={currentPage} navigateTo={navigateTo} />}
  <div className="flex flex-col flex-grow w-full h-full overflow-hidden">
    {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
    <main className="flex-grow overflow-y-auto w-full h-full px-6 py-6 md:px-8 md:py-8">
      {renderPage()}
    </main>
  </div>
</div>
  );
};

export default App;