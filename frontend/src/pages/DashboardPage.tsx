// pages/DashboardPage.tsx
// Placeholder for the Dashboard page.
// This will show an overview of CRM activities.

import React from 'react'; // Already imported
import { BarChart2, Users, Activity, Target } from 'lucide-react'; // Already imported

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className={`p-3 rounded-full bg-opacity-20 ${color}`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value="1,280" icon={Users} color="bg-sky-500 text-sky-500" />
        <StatCard title="Active Campaigns" value="12" icon={Target} color="bg-green-500 text-green-500" />
        <StatCard title="Conversion Rate" value="15.3%" icon={BarChart2} color="bg-yellow-500 text-yellow-500" />
        <StatCard title="Recent Activities" value="34" icon={Activity} color="bg-purple-500 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Campaigns</h3>
          {/* Placeholder for recent campaigns list */}
          <ul className="space-y-3">
            {['Summer Sale', 'New User Welcome', 'Holiday Special'].map(name => (
              <li key={name} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                {name} - <span className="text-sm text-green-600">Active</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Audience Growth</h3>
          {/* Placeholder for a chart */}
          <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Audience Growth Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; // Default export handled by App.tsx for current structure