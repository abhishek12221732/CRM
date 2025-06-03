// pages/AudienceBuilderPage.tsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Users, Save, ChevronRight, ChevronLeft, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api.ts';

// Types remain the same
interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string | number;
}

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
  const navigate = useNavigate();
  const [segmentName, setSegmentName] = useState<string>('');
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([
    { id: crypto.randomUUID(), combinator: 'AND', rules: [] }
  ]);
  const [audienceSizePreview, setAudienceSizePreview] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCampaignHistory, setShowCampaignHistory] = useState<boolean>(false);

  const fields = [
    { id: 'totalSpend', name: 'Total Spend (INR)' },
    { id: 'visitCount', name: 'Number of Visits' },
    { id: 'daysSinceLastPurchase', name: 'Days Since Last Purchase' },
    { id: 'customTags', name: 'Custom Tag' },
  ];
  console.log(isLoading);
  console.log(audienceSizePreview);

  const operators: Record<string, string[]> = {
    totalSpend: ['>', '<', '=', '>=', '<='],
    visitCount: ['>', '<', '=', '>=', '<='],
    daysSinceLastPurchase: ['>', '<', '=', '>=', '<='],
    customTags: ['IS', 'IS_NOT', 'CONTAINS'],
  };

  useEffect(() => {
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
      campaignResponse;

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



return (
    <div className="max-w-4xl mx-auto px-4 py-4 text-black"> {/* Added text-black here */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-black">
          {showCampaignHistory ? 'Campaign History' : 'Audience Builder'}
        </h1>
        <button
          onClick={() => setShowCampaignHistory(!showCampaignHistory)}
          className="flex items-center gap-1 text-sm px-2 py-1 border border-black rounded text-white" 
        >
          {showCampaignHistory ? (
            <>
              <ChevronLeft size={14} />
              Back
            </>
          ) : (
            <>
              History
              <History size={14} />
            </>
          )}
        </button>
      </div>

      {showCampaignHistory ? (
        <div className="border border-black rounded overflow-hidden text-black"> {/* Added text-black */}
          <table className="w-full text-black"> {/* Added text-black */}
            <thead className="bg-gray-100 border-b border-black text-black"> {/* Added text-black */}
              <tr>
                <th className="px-3 py-2 text-left text-sm font-bold text-black"> {/* Added text-black */}
                  Campaign
                </th>
                <th className="px-3 py-2 text-left text-sm font-bold text-black"> {/* Added text-black */}
                  Status
                </th>
                <th className="px-3 py-2 text-left text-sm font-bold text-black"> {/* Added text-black */}
                  Audience
                </th>
                <th className="px-3 py-2 text-right text-sm font-bold text-black"> {/* Added text-black */}
                  {/* Empty header */}
                </th>
              </tr>
            </thead>
            <tbody className="text-black"> {/* Added text-black */}
              {campaigns.map(campaign => (
                <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50 text-black"> {/* Added text-black */}
                  <td className="px-3 py-2 text-sm text-black"> {/* Added text-black */}
                    {campaign.name}
                  </td>
                  <td className="px-3 py-2 text-sm text-black"> {/* Added text-black */}
                    <span className={`px-2 py-0.5 text-xs rounded ${campaign.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'} text-black`}> {/* Added text-black */}
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-black"> 
                    {campaign.totalRecipients}
                  </td>
                  <td className="px-3 py-2 text-right text-black"> 
                    <button 
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                      className="flex items-center gap-1 text-sm text-white" 
                    >
                      View <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3 text-black"> {/* Added text-black */}
          {/* Segment Name */}
          <div className="border border-black rounded p-3 text-black"> {/* Added text-black */}
            <label className="block text-sm font-bold mb-1 text-black"> {/* Added text-black */}
              Segment Name
            </label>
            <input
              type="text"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-black rounded text-black" 
            />
          </div>

          {/* Rule Groups */}
          {ruleGroups.map((group, groupIndex) => (
            <div key={group.id} className="border border-black rounded p-3 text-black"> {/* Added text-black */}
              <div className="flex justify-between items-center mb-2 text-black"> {/* Added text-black */}
                <h3 className="text-sm font-bold text-black"> {/* Added text-black */}
                  {groupIndex > 0 ? (
                    <select 
                      value={group.combinator} 
                      onChange={(e) => updateGroupCombinator(group.id, e.target.value as 'AND' | 'OR')}
                      className="font-bold border border-black rounded px-1 py-0.5 text-sm text-black"
                    >
                      <option value="AND" className="text-black">AND</option> {/* Added text-black */}
                      <option value="OR" className="text-black">OR</option> {/* Added text-black */}
                    </select>
                  ) : null}
                  {' '}Rule Group {groupIndex + 1}
                </h3>
                {ruleGroups.length > 1 && (
                  <button
                    onClick={() => removeRuleGroup(group.id)}
                    className="p-1 text-white" 
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              
              <div className="space-y-2 text-black"> {/* Added text-black */}
                {group.rules.map((rule) => (
                  <div key={rule.id} className="flex gap-2 items-center text-black"> {/* Added text-black */}
                    {group.rules.indexOf(rule) > 0 ? (
                      <select 
                        value={group.combinator}
                        onChange={(e) => updateGroupCombinator(group.id, e.target.value as 'AND' | 'OR')}
                        className="w-16 px-1 py-1 text-xs border border-black rounded text-black" 
                      >
                        <option value="AND" className="text-black">AND</option> {/* Added text-black */}
                        <option value="OR" className="text-black">OR</option> {/* Added text-black */}
                      </select>
                    ) : (
                      <div className="w-16"></div>
                    )}

                    <select 
                      value={rule.field}
                      onChange={(e) => updateRule(group.id, rule.id, { field: e.target.value })}
                      className="flex-1 px-1 py-1 text-xs border border-black rounded text-black" 
                    >
                      {fields.map(f => (
                        <option key={f.id} value={f.id} className="text-black"> {/* Added text-black */}
                          {f.name}
                        </option>
                      ))}
                    </select>
                    
                    <select 
                      value={rule.operator}
                      onChange={(e) => updateRule(group.id, rule.id, { operator: e.target.value })}
                      className="w-20 px-1 py-1 text-xs border border-black rounded text-black" 
                    >
                      {(operators[rule.field] || []).map(op => (
                        <option key={op} value={op} className="text-black"> {/* Added text-black */}
                          {op}
                        </option>
                      ))}
                    </select>
                    
                    <input 
                      type={['totalSpend', 'visitCount', 'daysSinceLastPurchase'].includes(rule.field) ? 'number' : 'text'}
                      value={rule.value}
                      onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border border-black rounded text-black" 
                    />
                    
                    <button 
                      onClick={() => removeRuleFromGroup(group.id, rule.id)}
                      className="p-1 text-white" 
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addRuleToGroup(group.id)}
                className="mt-2 flex items-center gap-1 text-xs px-2 py-1 border border-black rounded text-white" 
              >
                <PlusCircle size={12} />
                Add Rule
              </button>
            </div>
          ))}

          {/* Add Rule Group Button */}
          <button
            onClick={addRuleGroup}
            className="flex items-center justify-center gap-1 text-sm px-3 py-1.5 border border-black rounded mx-auto text-white"
          >
            <PlusCircle size={14} />
            Add Rule Group
          </button>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-black"> {/* Added text-black */}
            <button
              onClick={handlePreviewAudience}
              className="flex items-center gap-1 text-sm px-3 py-1.5 border border-black rounded text-white" 
            >
              <Users size={14} />
              Preview Audience
            </button>
            <button
              onClick={handleSaveSegment}
              className="flex items-center gap-1 text-sm px-3 py-1.5 bg-black text-white rounded"
            >
              <Save size={14} />
              Save Segment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceBuilderPage;