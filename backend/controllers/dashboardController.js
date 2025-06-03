// controllers/dashboardController.js
const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'running' });
    
    // Example conversion rate calculation (adjust based on your business logic)
    const completedCampaigns = await Campaign.find({ status: 'completed' });
    const totalSent = completedCampaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalRecipients = completedCampaigns.reduce((sum, c) => sum + c.totalRecipients, 0);
    const conversionRate = totalRecipients > 0 ? (totalSent / totalRecipients) * 100 : 0;

    // Recent activities (example - adjust based on your needs)
    const recentActivities = await CommunicationLog.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      totalCustomers,
      activeCampaigns,
      conversionRate,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};