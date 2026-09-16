const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  maxFileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
  uploadDir: path.join(__dirname, '../../', process.env.UPLOAD_DIR || 'src/uploads'),
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  storageDriver: process.env.STORAGE_DRIVER || 'LOCAL',
};
