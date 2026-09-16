const info = (message, ...meta) => {
  console.log(`[INFO] [${new Date().toISOString()}] ${message}`, meta.length ? meta : '');
};

const error = (message, err) => {
  console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, err || '');
};

const warn = (message, ...meta) => {
  console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta.length ? meta : '');
};

module.exports = {
  info,
  error,
  warn,
};
