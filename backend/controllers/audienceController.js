const AudienceSegment = require('../models/AudienceSegment');
const Customer = require('../models/Customer');
const { validateSegmentRules } = require('../utils/validation');
const audienceService = require('../services/audienceService');

exports.createSegment = async (req, res) => {
  try {
    const { name, description, ruleGroups } = req.body;
    const userId = req.user.id;

    // Validate rules
    const validationError = validateSegmentRules(ruleGroups);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Estimate audience size
    const estimatedSize = await audienceService.estimateAudienceSize(ruleGroups);

    const segment = new AudienceSegment({
      name,
      description,
      ruleGroups,
      estimatedSize,
      createdBy: userId
    });

    await segment.save();

    res.status(201).json(segment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSegments = async (req, res) => {
  try {
    const segments = await AudienceSegment.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSegmentById = async (req, res) => {
  try {
    const segment = await AudienceSegment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    res.json(segment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.estimateAudienceSize = async (req, res) => {
  try {
    const { ruleGroups } = req.body;
    
    const validationError = validateSegmentRules(ruleGroups);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const estimatedSize = await audienceService.estimateAudienceSize(ruleGroups);
    res.json({ estimatedSize });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};