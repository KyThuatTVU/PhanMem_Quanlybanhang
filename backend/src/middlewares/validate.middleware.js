const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

/**
  Higher-order function tạo Middleware validate request với Joi
  @param {Object} schema - Joi validation schema ({ body, query, params })
 */
const validate = (schema) => (req, res, next) => {
  const parts = ['body', 'query', 'params'];

  for (const part of parts) {
    if (schema[part]) {
      const { error, value } = schema[part].validate(req[part], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errorDetails = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
        }));

        return next(new AppError(ERROR_CODES.VALIDATION_ERROR, 'Dữ liệu đầu vào không hợp lệ', errorDetails));
      }

      req[part] = value;
    }
  }

  next();
};

module.exports = validate;
