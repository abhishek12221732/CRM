import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, ArrowUpDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../api';

interface Campaign {
  id: string;
  name: string;
  segmentId: string;
  segmentName: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  message: string;
}

// API Base URL (adjust for backend port if needed)
const API_BASE_URL = 'http://localhost:5000';

const CampaignHistoryPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('api/campaign');

        // Transform API response to match frontend expectations
        const transformedCampaigns = response.data.map((campaign: any) => ({
          id: campaign._id,
          name: campaign.name,
          segmentId: campaign.segmentId?._id || campaign.segmentId, // Ensure `segmentId` is valid
          segmentName: campaign.segmentId?.name || 'Unknown Segment',
          status: campaign.status,
          totalRecipients: campaign.totalRecipients,
          sentCount: campaign.sentCount,
          failedCount: campaign.failedCount,
          createdAt: campaign.createdAt,
          startedAt: campaign.startedAt,
          completedAt: campaign.completedAt,
          message: campaign.message,
        }));

        // Sort campaigns by creation date
        const sortedCampaigns = [...transformedCampaigns].sort((a, b) =>
          sortOrder === 'desc'
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setCampaigns(sortedCampaigns);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaign data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: string } = {
      completed: 'Completed',
      running: 'Sending',
      failed: 'Failed',
      scheduled: 'Scheduled',
      draft: 'Draft',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-sky-500" />
        <span className="ml-2 text-gray-600">Loading campaigns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Campaign History</h2>
        <button
          onClick={toggleSortOrder}
          className="flex items-center space-x-1 p-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowUpDown size={16} />
          <span>Sort by Date ({sortOrder === 'asc' ? 'Oldest First' : 'Newest First'})</span>
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Campaign Name', 'Audience', 'Audience Size', 'Sent Date', 'Status', 'Delivery Stats (Sent/Failed)'].map(
                (header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.segmentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Users size={16} className="mr-1 text-gray-400" /> {campaign.totalRecipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {getStatusDisplay(campaign.status)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No campaigns found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignHistoryPage;