const fs = require('fs');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

const signatures = [
  { mime: 'image/jpeg', matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { mime: 'image/png', matches: (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/webp', matches: (bytes) => bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP' },
];

const validateImageSignature = (req, res, next) => {
  if (!req.file) return next();

  try {
    const bytes = Buffer.alloc(12);
    const fileHandle = fs.openSync(req.file.path, 'r');
    fs.readSync(fileHandle, bytes, 0, bytes.length, 0);
    fs.closeSync(fileHandle);

    const signature = signatures.find((candidate) => candidate.matches(bytes));
    if (!signature || signature.mime !== req.file.mimetype) {
      fs.unlinkSync(req.file.path);
      return next(new AppError(ERROR_CODES.VALIDATION_ERROR, 'Nội dung file không khớp định dạng hình ảnh được phép'));
    }

    return next();
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return next(new AppError(ERROR_CODES.VALIDATION_ERROR, 'Không thể kiểm tra file hình ảnh'));
  }
};

module.exports = validateImageSignature;
