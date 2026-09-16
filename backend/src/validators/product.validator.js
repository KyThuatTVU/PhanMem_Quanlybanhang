const Joi = require('joi');

const createProductSchema = {
  body: Joi.object({
    code: Joi.string().trim().required().messages({ 'any.required': 'Mã sản phẩm bắt buộc nhập' }),
    sku: Joi.string().allow('', null),
    name: Joi.string().trim().required().messages({ 'any.required': 'Tên sản phẩm bắt buộc nhập' }),
    categoryId: Joi.number().integer().positive().allow(null),
    brandId: Joi.number().integer().positive().allow(null),
    baseUnitId: Joi.number().integer().positive().required().messages({ 'any.required': 'Đơn vị tính cơ sở bắt buộc chọn' }),
    allowDecimal: Joi.boolean().default(false),
    minStockAlert: Joi.number().min(0).default(0),
    description: Joi.string().allow('', null),
    units: Joi.array()
      .items(
        Joi.object({
          unitId: Joi.number().integer().positive().required(),
          conversionRate: Joi.number().positive().required(),
          isBaseUnit: Joi.boolean().default(false),
          costPrice: Joi.number().min(0).default(0),
          retailPrice: Joi.number().min(0).default(0),
          wholesalePrice: Joi.number().min(0).default(0),
          barcode: Joi.string().allow('', null),
        })
      )
      .min(1)
      .required(),
  }),
};

module.exports = {
  createProductSchema,
};
