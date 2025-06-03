const express = require('express');
const router = express.Router();
const audienceController = require('../controllers/audienceController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', audienceController.createSegment);
router.get('/', audienceController.getSegments);
router.get('/:id', audienceController.getSegmentById);
router.post('/estimate', audienceController.estimateAudienceSize);

module.exports = router;