const Campaign = require('../models/Campaign');
const AudienceSegment = require('../models/AudienceSegment');
const CommunicationLog = require('../models/CommunicationLog');
const campaignService = require('../services/campaignService');

exports.createCampaign = async (req, res) => {
  try {
    const { segmentId, name, message, scheduledAt } = req.body;
    const userId = req.user.id;

    // Check if segment exists
    const segment = await AudienceSegment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    const campaign = new Campaign({
      name,
      segmentId,
      message,
      scheduledAt,
      totalRecipients: segment.estimatedSize,
      createdBy: userId
    });

    await campaign.save();

    // Start campaign (in background)
    campaignService.startCampaign(campaign._id);

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('segmentId', 'name estimatedSize');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segmentId', 'name estimatedSize');
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const logs = await CommunicationLog.find({ campaignId: campaign._id })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ campaign, logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { campaignId, customerId, status, statusDetails } = req.body;
    
    await campaignService.updateDeliveryStatus(campaignId, customerId, status, statusDetails);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};