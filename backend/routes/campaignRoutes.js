const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', campaignController.createCampaign);
router.get('/', campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.post('/delivery-status', campaignController.updateDeliveryStatus);

module.exports = router;