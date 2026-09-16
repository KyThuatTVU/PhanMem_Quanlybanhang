const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// 1. Security & Logging Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 2. Rate Limiting (Chống DDOS / Brute-force)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 300, // Tối đa 300 request / IP
  message: {
    success: false,
    message: 'Số lượng yêu cầu quá mức cho phép, vui lòng thử lại sau ít phút.',
    errorCode: 'TOO_MANY_REQUESTS',
  },
});
app.use('/api/', apiLimiter);

// 3. Static Files (Cho phép phục vụ file upload công khai)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 4. API Routes Router
app.use('/api/v1', routes);

// 5. Xử lý khi truy cập Route không tồn tại (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn ${req.originalUrl} không tồn tại trên hệ thống API`,
    errorCode: 'ROUTE_NOT_FOUND',
  });
});

// 6. Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
