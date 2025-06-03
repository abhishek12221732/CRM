import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Activity, Target, AlertTriangle, Loader2 } from 'lucide-react'; // Added Loader2 and AlertTriangle
import api from '../api';

interface Campaign {
  _id: string; // Changed id to _id to match typical MongoDB ObjectId
  name: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}

interface DashboardStats {
  totalCustomers: number;
  activeCampaigns: number;
  conversionRate: number; // Assuming this is a percentage, e.g., 25 for 25%
  recentActivities: number; // Example: count of recent logs or actions
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; iconColorClass: string; unit?: string }> = ({ title, value, icon: Icon, iconColorClass, unit }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-4">
    <div className={`p-3 rounded-lg bg-opacity-10 ${iconColorClass.replace('text-', 'bg-')}`}>
      <Icon className={`w-7 h-7 ${iconColorClass}`} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-3xl font-semibold text-slate-800">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg ml-1 text-slate-600">{unit}</span>}
      </p>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null); // Initialize as null
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        
        const [statsResponse, campaignsResponse] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/campaign?limit=5&sort=-createdAt') // Fetch 5 newest campaigns
        ]);

        setStats(statsResponse.data);
        setCampaigns(campaignsResponse.data.map((c: any) => ({...c, _id: c._id || c.id }))); // Ensure _id compatibility

      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 text-slate-600">
        <Loader2 className="w-12 h-12 animate-spin text-sky-600 mb-4" />
        <p className="text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !stats) { // Also check if stats is null
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-xl shadow-md flex items-center space-x-3">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <div>
            <h3 className="font-semibold text-lg">Loading Error</h3>
            <p>{error || "Could not load dashboard statistics."}</p>
        </div>
      </div>
    );
  }
  // Utility to get status styling
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'running': case 'sending': return 'text-yellow-700 bg-yellow-100';
      case 'failed': return 'text-red-700 bg-red-100';
      case 'scheduled': return 'text-blue-700 bg-blue-100';
      case 'draft': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };


  return (
    <div className="space-y-8"> {/* Increased spacing between sections */}
      <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          iconColorClass="text-sky-600" 
        />
        <StatCard 
          title="Active Campaigns" 
          value={stats.activeCampaigns} 
          icon={Target} 
          iconColorClass="text-green-600" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={stats.conversionRate.toFixed(1)} 
          unit="%"
          icon={BarChart2} 
          iconColorClass="text-amber-600" // Changed to amber for variety
        />
        <StatCard 
          title="Recent Activities" 
          value={stats.recentActivities} 
          icon={Activity} 
          iconColorClass="text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-slate-700 mb-5 border-b pb-3 border-slate-200">Recent Campaigns</h3>
          {campaigns.length > 0 ? (
            <ul className="space-y-4">
              {campaigns.map(campaign => (
                <li key={campaign._id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-150 ease-in-out">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">{campaign.name}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyles(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5">
                    Recipients: {campaign.totalRecipients.toLocaleString()} • Sent: {campaign.sentCount.toLocaleString()} • Failed: {campaign.failedCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Created: {new Date(campaign.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-center py-8">No recent campaigns to display.</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-slate-700 mb-5 border-b pb-3 border-slate-200">Audience Growth</h3>
          <div className="h-72 bg-slate-100 rounded-lg flex items-center justify-center">
            {/* Replace with actual chart component, e.g., Recharts or Chart.js */}
            <BarChart2 className="w-16 h-16 text-slate-400 opacity-50" />
            <p className="text-slate-500 ml-2">Audience Growth Chart (Placeholder)</p>
          </div>
           <p className="text-xs text-slate-400 mt-3 text-center">Insightful chart coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;