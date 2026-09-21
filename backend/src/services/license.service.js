const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const LICENSE_SECRET = process.env.LICENSE_SECRET || 'kora_pos_commercial_license_secret_key_2026';
const LICENSE_FILE_PATH = path.join(__dirname, '../../license.json');

/**
 * Service Quản Lý & Xác Thực Bản Quyền Phần Mềm (Software License & HWID Verification)
 */
class LicenseService {
  /**
   * Tạo chữ ký số HMAC-SHA256 cho Giấy Phép Bản Quyền
   */
  static generateSignature(payload) {
    const dataString = `${payload.licenseKey}|${payload.storeName}|${payload.expiresAt}|${payload.maxTerminals}`;
    return crypto.createHmac('sha256', LICENSE_SECRET).update(dataString).digest('hex');
  }

  /**
   * Khởi tạo Giấy Phép Mặc Định (Nếu chưa có)
   */
  static initDefaultLicense() {
    if (!fs.existsSync(LICENSE_FILE_PATH)) {
      const defaultPayload = {
        licenseKey: 'KORA-2026-COMMERCIAL-PRO',
        storeName: 'Tạp Hóa Vũ An',
        issuedAt: new Date().toISOString(),
        expiresAt: '2030-12-31T23:59:59.000Z',
        maxTerminals: 10,
        status: 'ACTIVE',
      };
      defaultPayload.signature = this.generateSignature(defaultPayload);
      try {
        fs.writeFileSync(LICENSE_FILE_PATH, JSON.stringify(defaultPayload, null, 2), 'utf-8');
      } catch (err) {
        console.error('Không thể tạo file license.json mặc định:', err.message);
      }
      return defaultPayload;
    }

    try {
      const content = fs.readFileSync(LICENSE_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Xác Thực Tính Hợp Lệ Của Giấy Phép
   */
  static verifyLicense() {
    const license = this.initDefaultLicense();
    if (!license) {
      return { valid: false, reason: 'Không tìm thấy Giấy phép bản quyền (license.json)' };
    }

    // 1. Kiểm tra chữ ký số HMAC
    const expectedSig = this.generateSignature(license);
    if (license.signature !== expectedSig) {
      return { valid: false, reason: 'Giấy phép bản quyền bị can thiệp hoặc không hợp lệ (Signature Mismatch)' };
    }

    // 2. Kiểm tra hạn sử dụng
    const now = new Date();
    const expiry = new Date(license.expiresAt);
    if (now > expiry) {
      return { valid: false, reason: `Giấy phép phần mềm đã hết hạn vào ngày ${expiry.toLocaleDateString('vi-VN')}` };
    }

    // 3. Kiểm tra trạng thái
    if (license.status !== 'ACTIVE') {
      return { valid: false, reason: 'Giấy phép phần mềm đang ở trạng thái bị tạm khóa (SUSPENDED)' };
    }

    return {
      valid: true,
      licenseKey: license.licenseKey,
      storeName: license.storeName,
      expiresAt: license.expiresAt,
      maxTerminals: license.maxTerminals,
    };
  }
}

module.exports = LicenseService;
