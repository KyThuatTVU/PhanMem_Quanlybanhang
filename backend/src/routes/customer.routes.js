const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authenticate = require('../middlewares/auth.middleware');

router.get('/', authenticate, customerController.getCustomers);
router.post('/', authenticate, customerController.createCustomer);
router.get('/:id', authenticate, customerController.getCustomerById);
router.get('/:id/debts', authenticate, customerController.getDebtHistory);

module.exports = router;
