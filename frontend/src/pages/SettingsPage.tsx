import React, { useState } from 'react';
import { User, Bell, Link, KeyRound, Palette, Save, ShieldAlert } from 'lucide-react'; // Added more icons

const SettingsSection: React.FC<{ title: string; description: string; icon: React.ElementType; children: React.ReactNode; onSave?: () => void; isLoading?: boolean }> = ({ title, description, icon: Icon, children, onSave, isLoading }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex items-start mb-5 border-b border-slate-200 pb-4">
        <Icon size={28} className="mr-4 text-sky-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="space-y-5">
        {children}
      </div>
      {onSave && (
        <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end">
          <button 
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75"
          >
            {isLoading ? <Save size={18} className="animate-spin" /> : <Save size={18} />}
            <span>{isLoading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Example Input component for settings
const SettingsInput: React.FC<{ label: string; id: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; description?: string; disabled?: boolean }> = 
({ label, id, type = "text", value, onChange, placeholder, description, disabled }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        {description && <p className="mt-1.5 text-xs text-slate-500">{description}</p>}
    </div>
);

// Example Toggle component
const SettingsToggle: React.FC<{ label: string; id: string; enabled: boolean; onToggle: () => void; description?: string }> =
({ label, id, enabled, onToggle, description }) => (
    <div className="flex items-center justify-between">
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
            {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        <button
            type="button"
            id={id}
            onClick={onToggle}
            className={`${enabled ? 'bg-sky-600' : 'bg-slate-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
            role="switch"
            aria-checked={enabled}
        >
            <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
        </button>
    </div>
);


const SettingsPage: React.FC = () => {
  // Example state for profile settings
  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john.doe@example.com' });
  const [notifications, setNotifications] = useState({ emailCampaignUpdates: true, emailLoginAlerts: false });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };

  const handleSaveProfile = () => {
    setIsSavingProfile(true);
    console.log("Saving profile:", profile);
    // Simulate API call
    setTimeout(() => setIsSavingProfile(false), 1500);
  };
  
  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const handleSaveNotifications = () => {
    setIsSavingNotifications(true);
    console.log("Saving notifications:", notifications);
    setTimeout(() => setIsSavingNotifications(false), 1500);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-slate-800">Application Settings</h2>
      
      <SettingsSection 
        title="Profile Settings" 
        description="Manage your personal information and account details."
        icon={User}
        onSave={handleSaveProfile}
        isLoading={isSavingProfile}
      >
        <SettingsInput 
            label="Full Name" 
            id="name" 
            value={profile.name} 
            onChange={handleProfileChange}
            placeholder="Enter your full name"
        />
        <SettingsInput 
            label="Email Address" 
            id="email" 
            type="email"
            value={profile.email} 
            onChange={handleProfileChange} // Or make it disabled if sourced from OAuth
            placeholder="your.email@example.com"
            description="This email is used for login and notifications."
            // disabled // If email comes from Google Auth and shouldn't be changed
        />
      </SettingsSection>

      <SettingsSection 
        title="Notification Preferences" 
        description="Configure how you receive notifications from the application."
        icon={Bell}
        onSave={handleSaveNotifications}
        isLoading={isSavingNotifications}
      >
        <SettingsToggle
            label="Campaign Updates via Email"
            id="emailCampaignUpdates"
            enabled={notifications.emailCampaignUpdates}
            onToggle={() => handleNotificationToggle('emailCampaignUpdates')}
            description="Receive an email when a campaign completes or fails."
        />
         <SettingsToggle
            label="Security Alerts via Email"
            id="emailLoginAlerts"
            enabled={notifications.emailLoginAlerts}
            onToggle={() => handleNotificationToggle('emailLoginAlerts')}
            description="Get notified about new logins to your account."
        />
      </SettingsSection>

      <SettingsSection 
        title="Integrations" 
        description="Connect with other services and manage API keys (placeholders)."
        icon={Link}
        // No onSave for this example, could be individual connect/disconnect buttons
      >
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-700">Google Services</h4>
            <p className="text-xs text-slate-500 mb-2">Currently connected via Google OAuth for login.</p>
            <button className="text-sm text-sky-600 hover:text-sky-800 font-medium" disabled>Manage Google Connection (Placeholder)</button>
        </div>
         <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-700">AI API Key</h4>
            <p className="text-xs text-slate-500 mb-2">Enter your API key for AI features (if applicable).</p>
            <SettingsInput label="Your AI Provider API Key" id="aiApiKey" value="***********" onChange={() => {}} placeholder="sk-xxxxxxxxx" type="password" />
            <button className="mt-2 text-sm bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1.5 px-3 rounded-md" disabled>Update Key (Placeholder)</button>
        </div>
      </SettingsSection>
      
      <SettingsSection 
        title="Appearance" 
        description="Customize the look and feel of the application (concept)."
        icon={Palette}
      >
        <SettingsToggle
            label="Dark Mode"
            id="darkMode"
            enabled={false} // Example state
            onToggle={() => alert("Dark mode toggle clicked! (Not implemented)")}
            description="Switch between light and dark themes."
        />
      </SettingsSection>

      <SettingsSection 
        title="Account Security" 
        description="Manage your account's security settings."
        icon={KeyRound}
      >
         <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800">
            <div className="flex items-start">
                <ShieldAlert className="w-5 h-5 mr-2 mt-0.5 text-yellow-600" />
                <div>
                    <h4 className="font-semibold">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs">2FA is not yet enabled for your account. Consider enabling it for enhanced security.</p>
                    <button className="mt-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1.5 px-3 rounded-md">Enable 2FA (Placeholder)</button>
                </div>
            </div>
        </div>
         <button className="w-full sm:w-auto text-sm text-red-600 border border-red-300 hover:bg-red-50 font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
            Close Account (Placeholder)
        </button>
      </SettingsSection>
    </div>
  );
};

export default SettingsPage;