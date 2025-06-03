// pages/AudienceBuilderPage.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Filter, Users, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Changed useRouter to useNavigate
import axios from 'axios';
import api from '../api.ts';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define a type for a single rule
interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string | number;
}

// Define a type for a rule group
interface RuleGroup {
  id: string;
  combinator: 'AND' | 'OR';
  rules: Rule[];
}

interface Campaign {
  id: string;
  name: string;
  segmentId: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}

const AudienceBuilderPage: React.FC = () => {
  const navigate = useNavigate(); // Changed useRouter to useNavigate
  const [segmentName, setSegmentName] = useState<string>('');
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    { id: crypto.randomUUID(), combinator: 'AND', rules: [] }
  ]);
  const [audienceSizePreview, setAudienceSizePreview] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCampaignHistory, setShowCampaignHistory] = useState<boolean>(false);

  // Available fields for rules
  const fields = [
    { id: 'totalSpend', name: 'Total Spend (INR)' },
    { id: 'visitCount', name: 'Number of Visits' },
    { id: 'daysSinceLastPurchase', name: 'Days Since Last Purchase' },
    { id: 'customTags', name: 'Custom Tag' },
  ];

  // Available operators based on field type
  const operators: Record<string, string[]> = {
    totalSpend: ['>', '<', '=', '>=', '<='],
    visitCount: ['>', '<', '=', '>=', '<='],
    daysSinceLastPurchase: ['>', '<', '=', '>=', '<='],
    customTags: ['IS', 'IS_NOT', 'CONTAINS'],
  };

  useEffect(() => {
    // Fetch recent campaigns when component mounts
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('api/campaign');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const addRuleGroup = () => {
    setRuleGroups([...ruleGroups, { id: crypto.randomUUID(), combinator: 'OR', rules: [] }]);
  };

  const removeRuleGroup = (groupId: string) => {
    setRuleGroups(ruleGroups.filter(group => group.id !== groupId));
  };

  const updateGroupCombinator = (groupId: string, combinator: 'AND' | 'OR') => {
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId ? { ...group, combinator } : group
    ));
  };

  const addRuleToGroup = (groupId: string) => {
    const defaultField = fields[0].id;
    const defaultOperator = operators[defaultField][0];
    const newRule: Rule = { 
      id: crypto.randomUUID(), 
      field: defaultField, 
      operator: defaultOperator, 
      value: '' 
    };
    
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId ? { ...group, rules: [...group.rules, newRule] } : group
    ));
  };

  const updateRule = (groupId: string, ruleId: string, updatedRulePart: Partial<Rule>) => {
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId ? { 
        ...group, 
        rules: group.rules.map(rule => {
          if (rule.id === ruleId) {
            const newRule = { ...rule, ...updatedRulePart };
            // If field changes, update operator to the first valid one for the new field
            if (updatedRulePart.field && updatedRulePart.field !== rule.field) {
              newRule.operator = operators[newRule.field][0];
              newRule.value = ''; // Reset value when field changes
            }
            return newRule;
          }
          return rule;
        }) 
      } : group
    ));
  };
  
  const removeRuleFromGroup = (groupId: string, ruleId: string) => {
    setRuleGroups(ruleGroups.map(group => 
      group.id === groupId ? { ...group, rules: group.rules.filter(rule => rule.id !== ruleId) } : group
    ));
  };

  const handlePreviewAudience = async () => {
    setIsLoading(true);
    try {
      const response = await api.post(`/api/audience/estimate`, { ruleGroups });
      setAudienceSizePreview(response.data.estimatedSize);
    } catch (error) {
      console.error('Error previewing audience:', error);
      alert('Failed to preview audience. Please check your rules and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSegment = async () => {
    if (!segmentName.trim()) {
      alert('Please enter a segment name.');
      return;
    }

    setIsLoading(true);
    try {
      // Create the segment
      const segmentResponse = await api.post(`/api/audience`, {
        name: segmentName,
        ruleGroups
      });

      // Create a campaign for this segment
      const campaignResponse = await api.post(`/api/campaign`, {
        segmentId: segmentResponse.data._id,
        name: `Campaign for ${segmentName}`,
        message: `Hi {name}, here's a special offer just for you!`
      });

      // Show success and refresh campaigns
      alert('Segment and campaign created successfully!');
      fetchCampaigns();
      setShowCampaignHistory(true);
    } catch (error) {
      console.error('Error saving segment:', error);
      alert('Failed to save segment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">
          {showCampaignHistory ? 'Campaign History' : 'Create New Audience Segment'}
        </h2>
        <button
          onClick={() => setShowCampaignHistory(!showCampaignHistory)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          {showCampaignHistory ? 'Create New Segment' : 'View Campaign History'}
        </button>
      </div>

      {showCampaignHistory ? (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/campaign/${campaign.id}`)}> {/* Changed router.push to navigate */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          campaign.status === 'failed' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.totalRecipients}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.sentCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.failedCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(campaign.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <div>
              <label htmlFor="segmentName" className="block text-sm font-medium text-gray-700 mb-1">
                Segment Name
              </label>
              <input
                type="text"
                id="segmentName"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="e.g., High Value Customers Q3"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {ruleGroups.map((group, groupIndex) => (
            <div key={group.id} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
              <div className="flex justify-between items-center mb-3 border-b pb-3">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-700">
                    {groupIndex > 0 ? group.combinator : ''} Rule Group {groupIndex + 1}
                  </h3>
                  {groupIndex > 0 && (
                    <select 
                      value={group.combinator} 
                      onChange={(e) => updateGroupCombinator(group.id, e.target.value as 'AND' | 'OR')}
                      className="ml-3 p-1.5 border border-gray-300 rounded-md text-sm focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="AND">AND with previous group</option>
                      <option value="OR">OR with previous group</option>
                    </select>
                  )}
                </div>
                {ruleGroups.length > 1 && (
                  <button
                    onClick={() => removeRuleGroup(group.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 transition-colors"
                    title="Remove Rule Group"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              {group.rules.map((rule, ruleIndex) => (
                <div key={rule.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {ruleIndex > 0 && (
                    <select 
                      value={group.combinator}
                      onChange={(e) => updateGroupCombinator(group.id, e.target.value as 'AND' | 'OR')}
                      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm sm:w-auto w-full"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}
                  {ruleIndex === 0 && <div className="w-16 hidden sm:block"></div>}

                  <select 
                    value={rule.field}
                    onChange={(e) => updateRule(group.id, rule.id, { field: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:w-auto w-full"
                  >
                    {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <select 
                    value={rule.operator}
                    onChange={(e) => updateRule(group.id, rule.id, { operator: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:w-auto w-full"
                  >
                    {(operators[rule.field] || []).map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  <input 
                    type={['totalSpend', 'visitCount', 'daysSinceLastPurchase'].includes(rule.field) ? 'number' : 'text'}
                    value={rule.value}
                    onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                    placeholder="Value"
                    className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:w-auto w-full"
                  />
                  <button 
                    onClick={() => removeRuleFromGroup(group.id, rule.id)}
                    className="p-2 text-red-500 hover:text-red-700 rounded-md hover:bg-red-100 transition-colors self-center sm:self-auto"
                    title="Remove Rule"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addRuleToGroup(group.id)}
                className="flex items-center space-x-1 text-sm text-sky-600 hover:text-sky-800 p-2 rounded-md hover:bg-sky-100 transition-colors mt-2"
                disabled={isLoading}
              >
                <PlusCircle size={16} />
                <span>Add Rule to this Group ({group.rules.length > 0 ? group.combinator : 'Initial Rule'})</span>
              </button>
            </div>
          ))}
          
          <button
            onClick={addRuleGroup}
            className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-100 transition-colors border-2 border-green-500 border-dashed"
            disabled={isLoading}
          >
            <Filter size={16} />
            <span>Add Rule Group (acts as OR with previous group)</span>
          </button>

          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
              <button
                onClick={handlePreviewAudience}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Users size={18} />
                <span>{isLoading ? 'Calculating...' : 'Preview Audience Size'}</span>
              </button>
              {audienceSizePreview !== null && (
                <p className="text-gray-700 text-lg">
                  Estimated Audience Size: <span className="font-bold text-sky-600">{audienceSizePreview.toLocaleString()} customers</span>
                </p>
              )}
            </div>
            <button
              onClick={handleSaveSegment}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save size={18} />
              <span>{isLoading ? 'Saving...' : 'Save Segment & Create Campaign'}</span>
            </button>
          </div>

          {/* Placeholder for AI: Natural Language to Segment Rules */}
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-3 mt-6">
            <h3 className="text-lg font-medium text-gray-700">AI: Describe your audience (Coming Soon)</h3>
            <textarea 
              placeholder="e.g., 'People who haven't shopped in 6 months and spent over 5K'"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 min-h-[60px]"
              disabled 
            />
            <button 
              className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md opacity-50 cursor-not-allowed"
              disabled
            >
              Generate Rules with AI
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AudienceBuilderPage;