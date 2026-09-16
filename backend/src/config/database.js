const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quanly_cuahangtaphoa',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
  queueLimit: 0,
  timezone: '+07:00',
  dateStrings: true,
});

/**
  Kiểm tra kết nối tới MySQL khi khởi động server
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Chúc mừng đã kết nối thành công Cơ sở dữ liệu!');
    connection.release();
  } catch (error) {
    console.error('❌ Vui lòng kiểm tra lại đã bật dịch vụ Xampp chưa!:', error.message);
    process.exit(1);
  }
};

/**
  Wrapper thực thi Transaction an toàn cho Service Layer
 */
const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testConnection,
  withTransaction,
};
