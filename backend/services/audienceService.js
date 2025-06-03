const Customer = require('../models/Customer');

const estimateAudienceSize = async (ruleGroups) => {
  try {
    // Log the input ruleGroups
    console.log('[AUDIENCE_SERVICE] Estimating audience size for ruleGroups:', JSON.stringify(ruleGroups, null, 2));

    if (!Array.isArray(ruleGroups)) {
      console.error('[AUDIENCE_SERVICE] FATAL: ruleGroups is not an array:', ruleGroups);
      throw new Error('ruleGroups must be an array');
    }

    // Log the generated query
    const query = buildMongoQuery(ruleGroups); 
    console.log('[AUDIENCE_SERVICE] Generated MongoDB Query:', JSON.stringify(query, null, 2));

    // Critical check: If the query object is empty, it means no valid rules were processed
    // or the logic decided no query should be run.
    // Customer.countDocuments({}) would count ALL documents, which is usually not desired for an "empty" rule set.
    if (Object.keys(query).length === 0) {
      console.warn('[AUDIENCE_SERVICE] Query is empty. This implies no rules were applicable or all rules were invalid/empty. Returning 0.');
      return 0; // Explicitly return 0 if query is empty
    }

    // Log before counting
    console.log('[AUDIENCE_SERVICE] Executing Customer.countDocuments with query...');
    const count = await Customer.countDocuments(query);
    console.log('[AUDIENCE_SERVICE] Audience count from DB:', count);

    return count;
  } catch (error) {
    console.error('[AUDIENCE_SERVICE] Error in estimateAudienceSize service:', error.message, error.stack);
    // Re-throw for the controller to catch and send a proper server error response
    throw error;
  }
};

const buildMongoQuery = (ruleGroups) => {
  const mongoQuery = [];

  if (!Array.isArray(ruleGroups)) {
    throw new Error('ruleGroups must be an array');
  }

  for (const group of ruleGroups) {
    if (!group || typeof group !== 'object') {
      throw new Error('Each rule group must be an object');
    }

    if (!group.rules || !Array.isArray(group.rules)) {
      throw new Error('Each rule group must have a rules array');
    }

    if (!group.combinator || !['AND', 'OR'].includes(group.combinator)) {
      throw new Error('Invalid combinator: Must be "AND" or "OR"');
    }

    const groupConditions = [];

    for (const rule of group.rules) {
      if (!rule.field || typeof rule.field !== 'string') {
        throw new Error('Each rule must specify a valid field');
      }

      if (rule.value === undefined || rule.value === null || rule.value === '') {
        throw new Error(`Rule for field "${rule.field}" must have a value`);
      }

      // Use exported function to build conditions
      const condition = buildCondition(rule);
      groupConditions.push(condition);
    }

    if (groupConditions.length > 0) {
      mongoQuery.push(group.combinator === 'AND' ? { $and: groupConditions } : { $or: groupConditions });
    }
  }

  return mongoQuery.length > 0 ? (mongoQuery.length > 1 ? { $or: mongoQuery } : mongoQuery[0]) : {};
};

const buildCondition = (rule) => {
  const { field, operator, value } = rule;
  const numericFields = ['totalSpend', 'visitCount', 'daysSinceLastPurchase'];
  const isNumericField = numericFields.includes(field);

  switch (operator) {
    case '>':
      return { [field]: { $gt: isNumericField ? Number(value) : value } };
    case '<':
      return { [field]: { $lt: isNumericField ? Number(value) : value } };
    case '>=':
      return { [field]: { $gte: isNumericField ? Number(value) : value } };
    case '<=':
      return { [field]: { $lte: isNumericField ? Number(value) : value } };
    case '=':
      return { [field]: isNumericField ? Number(value) : value };
    case 'IS':
      return { [field]: value };
    case 'IS_NOT':
      return { [field]: { $ne: value } };
    case 'CONTAINS':
      return field === 'customTags'
        ? { [field]: { $in: [value] } }
        : { [field]: { $regex: value, $options: 'i' } };
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
};

// Export functions to use both inside and outside this file
module.exports = { estimateAudienceSize, buildMongoQuery, buildCondition };