const express = require('express');
const router = express.Router();
const settingController = require('../controllers/setting.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

// Settings
router.get('/', authenticate, settingController.getSettings);
router.post('/', authenticate, authorizeRoles('ADMIN'), settingController.updateSettings);

// Devices
router.get('/devices', authenticate, settingController.getDevices);
router.post('/devices', authenticate, authorizeRoles('ADMIN'), settingController.createDevice);

// Audit logs
router.get('/audit-logs', authenticate, authorizeRoles('ADMIN'), settingController.getAuditLogs);

module.exports = router;
