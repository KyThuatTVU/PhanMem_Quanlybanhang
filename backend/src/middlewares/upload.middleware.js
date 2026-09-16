const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('crypto'); // Dùng crypto native nodejs sinh ngẫu nhiên
const storageConfig = require('../config/storage');
const { AppError } = require('../utils/response.util');
const ERROR_CODES = require('../constants/error-codes');

// Cấu hình lưu trữ File vật lý bằng Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  },
});

// Kiểm tra Định dạng File an toàn (Chặn các file nguy hiểm .exe, .php, .js...)
const fileFilter = (req, file, cb) => {
  if (storageConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        'Chỉ cho phép tải lên định dạng hình ảnh hợp lệ (JPG, JPEG, PNG, WEBP)'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: storageConfig.maxFileSize },
  fileFilter,
});

module.exports = upload;
