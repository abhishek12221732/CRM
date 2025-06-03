// pages/SettingsPage.tsx
// Placeholder for the Settings page.
// Could include user profile, notification settings, integrations.

import React from 'react'; // Already imported
import { User, Bell, Link } from 'lucide-react'; // Already imported

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Settings</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <User size={20} className="mr-2 text-sky-600" /> Profile Settings
        </h3>
        <p className="text-gray-600">Manage your personal information and preferences.</p>
        {/* Add form fields for profile settings here */}
        <button className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
          Update Profile
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <Bell size={20} className="mr-2 text-yellow-500" /> Notification Preferences
        </h3>
        <p className="text-gray-600">Configure how you receive notifications.</p>
        {/* Add options for notification settings here */}
         <button className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
          Save Preferences
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <Link size={20} className="mr-2 text-green-500" /> Integrations
        </h3>
        <p className="text-gray-600">Connect with other services (e.g., Google, AI APIs).</p>
        {/* Add integration management options here */}
         <button className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors">
          Manage Integrations
        </button>
      </div>
    </div>
  );
};

export default SettingsPage; // Default export handled by App.tsx