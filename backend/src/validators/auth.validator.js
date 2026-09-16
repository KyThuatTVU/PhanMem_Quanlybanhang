const Joi = require('joi');

const loginSchema = {
  body: Joi.object({
    username: Joi.string().trim().required().messages({
      'any.required': 'Tên đăng nhập hoặc email không được để trống',
      'string.empty': 'Tên đăng nhập hoặc email không được để trống',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Mật khẩu không được để trống',
      'string.empty': 'Mật khẩu không được để trống',
    }),
  }),
};

const googleLoginSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      'any.required': 'Google ID Token không được để trống',
    }),
  }),
};

const changePasswordSchema = {
  body: Joi.object({
    oldPassword: Joi.string().required().messages({
      'any.required': 'Mật khẩu hiện tại không được để trống',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu mới không được để trống',
    }),
  }),
};

module.exports = {
  loginSchema,
  googleLoginSchema,
  changePasswordSchema,
};
