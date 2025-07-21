/**
 * Country / pricing settings
 * URL prefix: /api/settings
 */
const express = require('express');
const SettingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// ----- Public -----
router.get('/countries', SettingsController.getCountries);

// ----- Admin-protected -----
router.use(authenticateToken);

router.post('/countries',            SettingsController.createCountry);        // admin only
router.put ('/countries/:id',        SettingsController.updateCountry);        // admin only

module.exports = router;
