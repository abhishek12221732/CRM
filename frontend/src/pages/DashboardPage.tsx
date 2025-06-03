import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Activity, Target } from 'lucide-react';
import api from '../api'; // Your configured axios instance

interface Campaign {
  id: string;
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
  conversionRate: number;
  recentActivities: number;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
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
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCampaigns: 0,
    conversionRate: 0,
    recentActivities: 0
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [statsResponse, campaignsResponse] = await Promise.all([
          api.get('/api/dashboard/stats'),
          api.get('/api/campaign?limit=3')
        ]);

        setStats({
          totalCustomers: statsResponse.data.totalCustomers,
          activeCampaigns: statsResponse.data.activeCampaigns,
          conversionRate: statsResponse.data.conversionRate,
          recentActivities: statsResponse.data.recentActivities
        });

        setCampaigns(campaignsResponse.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers.toLocaleString()} 
          icon={Users} 
          color="bg-sky-500 text-sky-500" 
        />
        <StatCard 
          title="Active Campaigns" 
          value={stats.activeCampaigns} 
          icon={Target} 
          color="bg-green-500 text-green-500" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats.conversionRate.toFixed(1)}%`} 
          icon={BarChart2} 
          color="bg-yellow-500 text-yellow-500" 
        />
        <StatCard 
          title="Recent Activities" 
          value={stats.recentActivities} 
          icon={Activity} 
          color="bg-purple-500 text-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Campaigns</h3>
          <ul className="space-y-3">
            {campaigns.map(campaign => (
              <li key={campaign.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <span>{campaign.name}</span>
                  <span className={`text-sm ${
                    campaign.status === 'completed' ? 'text-green-600' :
                    campaign.status === 'failed' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Sent: {campaign.sentCount}/{campaign.totalRecipients} • Created: {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Audience Growth</h3>
          {/* Placeholder for a real chart - consider using Chart.js or similar */}
          <div className="h-64 bg-gray-200 rounded-md flex items-center justify-center">
            <p className="text-gray-500">Audience Growth Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;