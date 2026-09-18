const Joi = require('joi');

const cartItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  productUnitId: Joi.number().integer().positive().required(),
  quantity: Joi.number().positive().max(100000).required(),
  unitPrice: Joi.number().min(0).max(1000000000).required(),
  costPrice: Joi.number().min(0).max(1000000000).default(0),
  discountAmount: Joi.number().min(0).max(1000000000).default(0),
  conversionRate: Joi.number().positive().max(100000).required(),
});

const openShiftSchema = {
  body: Joi.object({
    startingCash: Joi.number().min(0).max(100000000000).required(),
  }),
};

const closeShiftSchema = {
  body: Joi.object({
    actualCashEnd: Joi.number().min(0).max(100000000000).required(),
    note: Joi.string().trim().max(500).allow('', null),
  }),
};

const checkoutSchema = {
  body: Joi.object({
    customerId: Joi.number().integer().positive().allow(null),
    cartItems: Joi.array().items(cartItemSchema).min(1).max(500).required(),
    subtotalAmount: Joi.number().min(0).max(100000000000).required(),
    discountAmount: Joi.number().min(0).max(100000000000).default(0),
    grandTotal: Joi.number().min(0).max(100000000000).required(),
    paidAmount: Joi.number().min(0).max(100000000000).required(),
    changeAmount: Joi.number().min(0).max(100000000000).default(0),
    debtAmount: Joi.number().min(0).max(100000000000).default(0),
    paymentMethod: Joi.string().valid('CASH', 'BANK_TRANSFER', 'CARD', 'CREDIT').default('CASH'),
    referenceCode: Joi.string().trim().max(100).allow('', null),
  }),
};

module.exports = { openShiftSchema, closeShiftSchema, checkoutSchema };
