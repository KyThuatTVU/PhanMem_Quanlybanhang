const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const authenticate = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

router.get('/roles', authenticate, employeeController.getRoles);
router.get('/permissions', authenticate, employeeController.getPermissions);

router.get('/', authenticate, authorizeRoles('ADMIN', 'MANAGER'), employeeController.getEmployees);
router.get('/:id', authenticate, authorizeRoles('ADMIN', 'MANAGER'), employeeController.getEmployeeById);
router.post('/', authenticate, authorizeRoles('ADMIN'), employeeController.createEmployee);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), employeeController.updateEmployee);
router.patch('/:id/toggle-status', authenticate, authorizeRoles('ADMIN'), employeeController.toggleStatus);
router.get('/:id/kpi', authenticate, authorizeRoles('ADMIN', 'MANAGER'), employeeController.getSalesKpi);

module.exports = router;
