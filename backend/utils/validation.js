const validateSegmentRules = (ruleGroups) => {
  if (!Array.isArray(ruleGroups)) {
    return 'Rule groups must be an array';
  }

  for (const group of ruleGroups) {
    if (!group || typeof group !== 'object') {
      return 'Each rule group must be an object';
    }

    if (!group.rules || !Array.isArray(group.rules)) {
      return 'Each rule group must have a rules array';
    }

    if (!group.combinator || !['AND', 'OR'].includes(group.combinator)) {
      return 'Invalid combinator: Must be "AND" or "OR"';
    }

    for (const rule of group.rules) {
      if (!rule.field || typeof rule.field !== 'string') {
        return 'Each rule must specify a valid field';
      }

      const validOperators = {
        totalSpend: ['>', '<', '=', '>=', '<='],
        visitCount: ['>', '<', '=', '>=', '<='],
        daysSinceLastPurchase: ['>', '<', '=', '>=', '<='],
        customTags: ['IS', 'IS_NOT', 'CONTAINS']
      };

      if (!rule.operator || !validOperators[rule.field]?.includes(rule.operator)) {
        return `Invalid operator "${rule.operator}" for field "${rule.field}"`;
      }

      if (rule.value === undefined || rule.value === null || rule.value === '') {
        return `Rule for field "${rule.field}" must have a value`;
      }
    }
  }

  return null; // No validation errors
};

module.exports = { validateSegmentRules };