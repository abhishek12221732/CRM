import React from 'react'; // Already imported
import { LogOut, UserCircle } from 'lucide-react'; // Already imported

interface HeaderProps {
  user: { name: string; email: string; photoURL?: string } | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-700">CRM Dashboard</h1>
      {user && (
        <div className="flex items-center space-x-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full" />
          ) : (
            <UserCircle className="w-8 h-8 text-gray-600" />
          )}
          <span className="text-gray-600">{user.name}</span>
          <button
            onClick={onLogout}
            className="p-2 rounded-md hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
};
