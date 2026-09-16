const app = require('./app');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger.util');

const PORT = process.env.PORT || 5000;

// Khởi chạy Server và kết nối CSDL
const startServer = async () => {
  try {
    // 1. Kiểm tra kết nối CSDL MySQL
    await testConnection();

    // 2. Lắng nghe cổng HTTP
    app.listen(PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 Grocery Store Backend API running on port ${PORT}`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Base API: http://localhost:${PORT}/api/v1`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
