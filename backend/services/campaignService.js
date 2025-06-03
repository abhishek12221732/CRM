const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const vendorService = require('./vendorService');
const AudienceSegment = require('../models/AudienceSegment');
const audienceService = require('../services/audienceService');

exports.startCampaign = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== 'draft') {
      return;
    }

    // Update campaign status
    campaign.status = 'running';
    campaign.startedAt = new Date();
    await campaign.save();

    // Get segment rules
    const segment = await AudienceSegment.findById(campaign.segmentId);
    if (!segment) {
      throw new Error('Segment not found');
    }

    // Find matching customers
    const query = audienceService.buildMongoQuery(segment.ruleGroups);
    const customers = await Customer.find(query);

    // Process in batches
    const batchSize = 100;
    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);
      await processBatch(batch, campaign);
    }

    // Update campaign status
    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();
  } catch (error) {
    console.error('Error in campaign processing:', error);
    
    // Update campaign status if error occurs
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      campaign.status = 'failed';
      await campaign.save();
    }
  }
};

async function processBatch(customers, campaign) {
  const promises = customers.map(customer => 
    sendMessageToCustomer(customer, campaign)
  );
  
  await Promise.all(promises);
}

async function sendMessageToCustomer(customer, campaign) {
  try {
    // Create log entry
    const log = new CommunicationLog({
      campaignId: campaign._id,
      customerId: customer.customerId,
      message: campaign.message,
      status: 'pending'
    });
    await log.save();

    // Send via vendor API
    const result = await vendorService.sendMessage({
      customerId: customer.customerId,
      phone: customer.phone,
      email: customer.email,
      message: campaign.message
    });

    // Update log based on result
    log.status = result.success ? 'sent' : 'failed';
    log.statusDetails = result.message;
    log.sentAt = new Date();
    await log.save();

    // Update campaign stats
    await Campaign.updateOne(
      { _id: campaign._id },
      { 
        $inc: { 
          sentCount: result.success ? 1 : 0,
          failedCount: result.success ? 0 : 1 
        } 
      }
    );

    return result;
  } catch (error) {
    console.error('Error sending message to customer:', customer.customerId, error);
    
    // Update log with error
    await CommunicationLog.updateOne(
      { campaignId: campaign._id, customerId: customer.customerId },
      { 
        status: 'failed',
        statusDetails: error.message,
        sentAt: new Date()
      }
    );

    // Update campaign stats
    await Campaign.updateOne(
      { _id: campaign._id },
      { $inc: { failedCount: 1 } }
    );

    return { success: false, message: error.message };
  }
}

exports.updateDeliveryStatus = async (campaignId, customerId, status, statusDetails) => {
  try {
    const update = {
      status,
      statusDetails,
      updatedAt: new Date()
    };

    if (status === 'delivered') {
      update.deliveredAt = new Date();
    }

    await CommunicationLog.updateOne(
      { campaignId, customerId },
      update
    );

    // If you want to update campaign stats based on delivery status
    // you can add that logic here
  } catch (error) {
    console.error('Error updating delivery status:', error);
    throw error;
  }
};