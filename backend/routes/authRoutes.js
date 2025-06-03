const express = require('express');

const { googleAuthCallback } = require('../controllers/authController');

const authMiddleware = require('../middleware/auth');

const authController = require('../controllers/authController');


const router = express.Router();


router.post('/google-auth', googleAuthCallback);

router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;

