-- ==============================================================================
-- DATABASE SCHEMA: HỆ THỐNG QUẢN LÝ BÁN HÀNG TẠP HÓA QUY MÔ VỪA
-- DBMS: MySQL 8.x (Engine InnoDB, Charset utf8mb4, Collation utf8mb4_unicode_ci)
-- Kiến trúc sư CSDL & Chuyên viên Nghiệp vụ: Senior Database Architect
-- ==============================================================================

DROP DATABASE IF EXISTS `grocery_store_db`;
CREATE DATABASE `grocery_store_db` 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE `grocery_store_db`;

-- Tắt kiểm tra khóa ngoại tạm thời để khởi tạo
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. MEDIA & TỆP TIN TẢI LÊN (Local / S3 Ready)
-- ------------------------------------------------------------------------------
CREATE TABLE `media_files` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `original_name` VARCHAR(255) NOT NULL COMMENT 'Tên file gốc do client upload',
    `stored_name` VARCHAR(255) NOT NULL COMMENT 'Tên file uuid băm lưu trên đĩa',
    `file_path` VARCHAR(500) NOT NULL COMMENT 'Đường dẫn vật lý cục bộ hoặc bucket path',
    `file_url` VARCHAR(500) NOT NULL COMMENT 'Đường dẫn URL nội bộ / CDN để client hiển thị',
    `mime_type` VARCHAR(100) NOT NULL COMMENT 'image/jpeg, image/png, image/webp',
    `file_size` INT UNSIGNED NOT NULL COMMENT 'Dung lượng file tính bằng bytes',
    `storage_driver` ENUM('LOCAL', 'S3', 'MINIO') NOT NULL DEFAULT 'LOCAL' COMMENT 'Driver lưu trữ',
    `created_by` BIGINT UNSIGNED NULL COMMENT 'ID user thực hiện upload',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_stored_name` (`stored_name`),
    INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB COMMENT='Bảng lưu trữ thông tin file upload an toàn';

-- ------------------------------------------------------------------------------
-- 2. PHÂN QUYỀN, TÀI KHOẢN & GOOGLE AUTHENTICATION
-- ------------------------------------------------------------------------------
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NULL COMMENT 'Tên đăng nhập (nếu dùng mật khẩu)',
    `password_hash` VARCHAR(255) NULL COMMENT 'Mật khẩu mã hóa Argon2 hoặc Bcrypt',
    `full_name` VARCHAR(100) NOT NULL COMMENT 'Họ và tên nhân viên / quản trị',
    `email` VARCHAR(100) NOT NULL COMMENT 'Email định danh duy nhất (dùng cho cả Google Auth)',
    `phone` VARCHAR(20) NULL COMMENT 'Số điện thoại',
    `google_id` VARCHAR(100) NULL COMMENT 'ID định danh người dùng từ Google OAuth2',
    `auth_provider` ENUM('LOCAL', 'GOOGLE') NOT NULL DEFAULT 'LOCAL' COMMENT 'Phương thức xác thực chính',
    `avatar_id` BIGINT UNSIGNED NULL COMMENT 'Khóa ngoại tới media_files',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Hoạt động, 0: Khóa',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Xóa mềm',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`),
    UNIQUE KEY `uk_users_username` (`username`),
    UNIQUE KEY `uk_users_google_id` (`google_id`),
    INDEX `idx_users_phone` (`phone`),
    INDEX `idx_users_is_active` (`is_active`),
    CONSTRAINT `fk_users_avatar` FOREIGN KEY (`avatar_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Bảng thông tin nhân viên và tài khoản đăng nhập (Hỗ trợ Google Auth)';

CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã vai trò: ADMIN, MANAGER, CASHIER, WAREHOUSE',
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên hiển thị vai trò',
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_roles_code` (`code`)
) ENGINE=InnoDB COMMENT='Bảng danh mục vai trò chức năng';

CREATE TABLE `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL COMMENT 'Mã quyền: PRODUCT_VIEW, ORDER_CREATE, INVENTORY_ADJUST...',
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên quyền',
    `module` VARCHAR(50) NOT NULL COMMENT 'Nhóm chức năng: PRODUCTS, POS, ORDERS, INVENTORY, DEBT...',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permissions_code` (`code`),
    INDEX `idx_permissions_module` (`module`)
) ENGINE=InnoDB COMMENT='Danh sách quyền chi tiết trong hệ thống';

CREATE TABLE `user_roles` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Quan hệ N-N giữa User và Role';

CREATE TABLE `role_permissions` (
    `role_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`role_id`, `permission_id`),
    CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Quan hệ N-N giữa Role và Permission';

-- ------------------------------------------------------------------------------
-- 3. AUDIT LOGS, CẤU HÌNH HỆ THỐNG & THIẾT BỊ NGOẠI VI
-- ------------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NULL,
    `action` VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, CANCEL, PRICE_CHANGE...',
    `module` VARCHAR(50) NOT NULL COMMENT 'Tên bảng hoặc phân hệ nghiệp vụ',
    `record_id` BIGINT UNSIGNED NULL COMMENT 'ID của bản ghi bị tác động',
    `old_values` JSON NULL COMMENT 'Dữ liệu trước khi sửa (JSON)',
    `new_values` JSON NULL COMMENT 'Dữ liệu sau khi sửa (JSON)',
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_user` (`user_id`),
    INDEX `idx_audit_module_record` (`module`, `record_id`),
    INDEX `idx_audit_created_at` (`created_at`),
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Nhật ký hoạt động bảo mật đối soát dữ liệu';

CREATE TABLE `system_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `setting_key` VARCHAR(100) NOT NULL COMMENT 'Mã cấu hình (STORE_NAME, STORE_ADDRESS...)',
    `setting_value` TEXT NULL COMMENT 'Giá trị cấu hình',
    `description` VARCHAR(255) NULL,
    `data_type` ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') NOT NULL DEFAULT 'STRING',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_setting_key` (`setting_key`)
) ENGINE=InnoDB COMMENT='Bảng cấu hình hệ thống cửa hàng tạp hóa';

CREATE TABLE `devices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên thiết bị (VD: Máy in bill Quầy 1)',
    `device_type` ENUM('PRINTER', 'BARCODE_SCANNER', 'CASH_DRAWER', 'POS_TERMINAL') NOT NULL,
    `connection_type` ENUM('USB', 'LAN_TCP', 'BLUETOOTH', 'COM') NOT NULL,
    `ip_address` VARCHAR(50) NULL COMMENT 'Địa chỉ IP nếu dùng mạng LAN',
    `port` INT UNSIGNED NULL COMMENT 'Port mạng',
    `status` ENUM('ACTIVE', 'INACTIVE', 'ERROR') NOT NULL DEFAULT 'ACTIVE',
    `config_data` JSON NULL COMMENT 'Cấu hình bổ sung (khổ giấy 80mm/58mm, baudrate...)',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='Quản lý phần cứng ngoại vi bán hàng';

-- ------------------------------------------------------------------------------
-- 4. DANH MỤC SẢN PHẨM, THƯƠNG HIỆU, ĐƠN VỊ VÀ QUY ĐỔI
-- ------------------------------------------------------------------------------
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `parent_id` BIGINT UNSIGNED NULL COMMENT 'Hỗ trợ cây danh mục cha-con',
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã ngành hàng / danh mục',
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên ngành hàng (Bánh kẹo, Gia vị, Nước ngọt...)',
    `description` VARCHAR(255) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_categories_code` (`code`),
    CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Danh mục phân loại hàng hóa';

CREATE TABLE `brands` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên nhãn hàng (Coca-Cola, Vinamilk, Oishi...)',
    `logo_id` BIGINT UNSIGNED NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_brands_code` (`code`),
    CONSTRAINT `fk_brands_logo` FOREIGN KEY (`logo_id`) REFERENCES `media_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Thương hiệu / Nhãn hiệu sản phẩm';

CREATE TABLE `units` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT 'Tên đơn vị: Lon, Chai, Gói, Hộp, Thùng, Lốc, Kg, Lít...',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_units_name` (`name`)
) ENGINE=InnoDB COMMENT='Bảng danh mục các đơn vị tính cơ bản';

CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã sản phẩm định danh (SP0001...)',
    `sku` VARCHAR(50) NULL COMMENT 'Mã quản lý kho SKU',
    `name` VARCHAR(255) NOT NULL COMMENT 'Tên hàng hóa hiển thị',
    `category_id` BIGINT UNSIGNED NULL,
    `brand_id` BIGINT UNSIGNED NULL,
    `base_unit_id` BIGINT UNSIGNED NOT NULL COMMENT 'Đơn vị tính cơ sở nhỏ nhất dùng tính tồn kho',
    `allow_decimal` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1: Cho phép bán lẻ số thập phân (Kg, Mét), 0: Nguyên chiếc',
    `min_stock_alert` DECIMAL(12, 3) NOT NULL DEFAULT 0.000 COMMENT 'Cảnh báo khi tồn kho chạm mức tối thiểu',
    `max_stock_alert` DECIMAL(12, 3) NOT NULL DEFAULT 0.000 COMMENT 'Cảnh báo tồn kho quá nhiều',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Đang kinh doanh, 0: Ngừng bán',
    `description` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_products_code` (`code`),
    UNIQUE KEY `uk_products_sku` (`sku`),
    INDEX `idx_products_name` (`name`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_brand` (`brand_id`),
    INDEX `idx_products_is_active` (`is_active`),
    CONSTRAINT `fk_prod_cat` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_prod_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_prod_base_unit` FOREIGN KEY (`base_unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Bảng sản phẩm gốc định danh hàng hóa';

CREATE TABLE `product_units` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `unit_id` BIGINT UNSIGNED NOT NULL,
    `conversion_rate` DECIMAL(12, 3) NOT NULL DEFAULT 1.000 COMMENT 'Hệ số quy đổi ra đơn vị cơ sở (VD: Thùng 24 lon => 24.000)',
    `is_base_unit` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 nếu là đơn vị cơ sở (hệ số = 1)',
    `cost_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá nhập dự kiến cho quy cách đơn vị này',
    `retail_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá bán lẻ niêm yết tại quầy',
    `wholesale_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá bán buôn/sỉ cho khách quen/đại lý',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_product_unit` (`product_id`, `unit_id`),
    INDEX `idx_pu_prices` (`retail_price`, `wholesale_price`),
    CONSTRAINT `fk_pu_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pu_unit` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Quy đổi đơn vị tính và chính sách giá theo từng đơn vị';

CREATE TABLE `product_barcodes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_unit_id` BIGINT UNSIGNED NOT NULL COMMENT 'Mã vạch gắn theo từng quy cách (Chai mã khác, Thùng mã khác)',
    `barcode` VARCHAR(50) NOT NULL COMMENT 'Mã vạch chuẩn EAN-13, Code 128 hoặc tự sinh',
    `is_default` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 nếu là mã quét chính của đơn vị này',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_barcode` (`barcode`),
    INDEX `idx_pb_product_unit` (`product_id`, `product_unit_id`),
    CONSTRAINT `fk_pb_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pb_unit` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Quản lý mã vạch chi tiết cho POS quét tức thì';

CREATE TABLE `product_images` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `media_id` BIGINT UNSIGNED NOT NULL,
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1: Ảnh đại diện hiển thị danh sách',
    `display_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_prod_media` (`product_id`, `media_id`),
    CONSTRAINT `fk_pi_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pi_media` FOREIGN KEY (`media_id`) REFERENCES `media_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Liên kết hình ảnh tải lên của sản phẩm';

CREATE TABLE `product_price_histories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_unit_id` BIGINT UNSIGNED NOT NULL,
    `price_type` ENUM('COST', 'RETAIL', 'WHOLESALE') NOT NULL,
    `old_price` DECIMAL(15, 2) NOT NULL,
    `new_price` DECIMAL(15, 2) NOT NULL,
    `changed_by` BIGINT UNSIGNED NULL,
    `reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_pph_prod` (`product_id`, `product_unit_id`),
    CONSTRAINT `fk_pph_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pph_unit` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pph_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Lịch sử biến động giá bán và giá nhập';

-- ------------------------------------------------------------------------------
-- 5. KHÁCH HÀNG & NHÓM KHÁCH HÀNG
-- ------------------------------------------------------------------------------
CREATE TABLE `customer_groups` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL COMMENT 'Khách lẻ, Khách quen, Khách sỉ, Khách VIP',
    `discount_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Phần trăm giảm giá mặc định cho nhóm',
    `note` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cg_code` (`code`)
) ENGINE=InnoDB COMMENT='Nhóm khách hàng áp dụng chính sách giá và chiết khấu';

CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `group_id` BIGINT UNSIGNED NULL,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã khách hàng KH0001...',
    `name` VARCHAR(100) NOT NULL COMMENT 'Tên khách hàng',
    `phone` VARCHAR(20) NOT NULL COMMENT 'Số điện thoại định danh chính',
    `email` VARCHAR(100) NULL,
    `address` VARCHAR(255) NULL,
    `loyalty_points` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Điểm tích lũy mua hàng',
    `current_debt` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Công nợ hiện tại khách đang nợ quán',
    `debt_limit` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Hạn mức tối đa cho phép nợ (0 = không giới hạn)',
    `status` ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_cust_code` (`code`),
    INDEX `idx_cust_phone` (`phone`),
    INDEX `idx_cust_group` (`group_id`),
    CONSTRAINT `fk_cust_group` FOREIGN KEY (`group_id`) REFERENCES `customer_groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Thông tin khách hàng tích điểm và công nợ';

-- ------------------------------------------------------------------------------
-- 6. NHÀ CUNG CẤP & MUA HÀNG (NHẬP KHO)
-- ------------------------------------------------------------------------------
CREATE TABLE `suppliers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL COMMENT 'Tên nhà cung cấp / đại lý phân phối',
    `contact_name` VARCHAR(100) NULL COMMENT 'Tên người liên hệ đại diện',
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `address` VARCHAR(255) NULL,
    `tax_code` VARCHAR(50) NULL,
    `current_debt` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền quán đang còn nợ nhà cung cấp',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_supp_code` (`code`),
    INDEX `idx_supp_phone` (`phone`)
) ENGINE=InnoDB COMMENT='Quản lý nhà phân phối hàng hóa';

CREATE TABLE `purchase_orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã phiếu nhập PN0001...',
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Nhân viên lập phiếu nhập',
    `status` ENUM('DRAFT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `subtotal_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền hàng trước chiết khấu',
    `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Chiết khấu nhà cung cấp giảm',
    `tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền thuế VAT nếu có',
    `grand_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng thanh toán = Subtotal - Discount + Tax',
    `paid_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền quán đã trả cho NCC',
    `debt_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền còn nợ lại ghi vào công nợ',
    `note` TEXT NULL,
    `received_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ thực nhập',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_po_code` (`code`),
    INDEX `idx_po_supplier` (`supplier_id`),
    INDEX `idx_po_user` (`user_id`),
    INDEX `idx_po_received_at` (`received_at`),
    CONSTRAINT `fk_po_supp` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_po_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Phiếu nhập hàng hóa từ nhà cung cấp';

CREATE TABLE `purchase_order_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `purchase_order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_unit_id` BIGINT UNSIGNED NOT NULL COMMENT 'Quy cách đơn vị nhập (thùng, bao, chai...)',
    `quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Số lượng nhập theo đơn vị quy cách',
    `unit_price` DECIMAL(15, 2) NOT NULL COMMENT 'Giá nhập một đơn vị quy cách',
    `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `subtotal` DECIMAL(15, 2) NOT NULL COMMENT 'Thành tiền chi tiết mặt hàng',
    `conversion_rate` DECIMAL(12, 3) NOT NULL DEFAULT 1.000 COMMENT 'Snapshot tỷ lệ quy đổi tại thời điểm nhập',
    `base_quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Số lượng quy về đơn vị cơ sở = quantity * conversion_rate',
    `batch_number` VARCHAR(50) NULL COMMENT 'Số lô sản xuất',
    `expiry_date` DATE NULL COMMENT 'Hạn sử dụng ghi trên lô',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_pod_po` (`purchase_order_id`),
    INDEX `idx_pod_prod` (`product_id`),
    CONSTRAINT `fk_pod_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pod_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_pod_unit` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Chi tiết từng mặt hàng trong phiếu nhập';

CREATE TABLE `purchase_returns` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã phiếu trả TH-NCC001...',
    `purchase_order_id` BIGINT UNSIGNED NULL COMMENT 'Tham chiếu đơn nhập gốc nếu có',
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng giá trị hàng trả lại',
    `refund_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền mặt/chuyển khoản NCC trả lại cho quán',
    `debt_deduction` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Trừ trực tiếp vào công nợ đang nợ NCC',
    `status` ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `reason` VARCHAR(255) NULL COMMENT 'Lý do hàng cận hạn, hỏng, bao bì móp méo',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_pr_code` (`code`),
    INDEX `idx_pr_supp` (`supplier_id`),
    CONSTRAINT `fk_pr_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_pr_supp` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Phiếu xuất trả hàng cho nhà cung cấp';

CREATE TABLE `purchase_return_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `purchase_return_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_unit_id` BIGINT UNSIGNED NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `unit_price` DECIMAL(15, 2) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,
    `conversion_rate` DECIMAL(12, 3) NOT NULL DEFAULT 1.000,
    `base_quantity` DECIMAL(12, 3) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_prd_pr` (`purchase_return_id`),
    CONSTRAINT `fk_prd_pr` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_returns` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_prd_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_prd_unit` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Chi tiết danh mục hàng trả lại cho nhà cung cấp';

-- ------------------------------------------------------------------------------
-- 7. KHO HÀNG, TỒN KHO & THẺ KHO BIẾN ĐỘNG
-- ------------------------------------------------------------------------------
CREATE TABLE `inventory_stocks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `base_unit_id` BIGINT UNSIGNED NOT NULL,
    `quantity_on_hand` DECIMAL(12, 3) NOT NULL DEFAULT 0.000 COMMENT 'Tồn thực tế trong kho tính theo đơn vị cơ sở',
    `quantity_reserved` DECIMAL(12, 3) NOT NULL DEFAULT 0.000 COMMENT 'Số lượng đang tạm giữ cho đơn chờ giao',
    `last_cost_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá vốn bình quân hoặc giá nhập gần nhất',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_inv_stock_prod` (`product_id`),
    INDEX `idx_inv_stock_qty` (`quantity_on_hand`),
    CONSTRAINT `fk_inv_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_inv_unit` FOREIGN KEY (`base_unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Bảng lưu số tồn thực tế hiện hành (tính theo base_unit)';

CREATE TABLE `inventory_movements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `base_unit_id` BIGINT UNSIGNED NOT NULL,
    `movement_type` ENUM(
        'PURCHASE_IMPORT',       -- Nhập hàng từ NCC (+)
        'PURCHASE_RETURN',       -- Trả hàng cho NCC (-)
        'SALE_EXPORT',           -- Bán hàng cho khách (-)
        'CUSTOMER_RETURN',       -- Khách trả lại hàng (+)
        'STOCK_TAKE_ADJUST_IN',  -- Kiểm kê kho thừa (+)
        'STOCK_TAKE_ADJUST_OUT', -- Kiểm kê kho thiếu / hỏng (-)
        'MANUAL_ADJUST'          -- Điều chỉnh thủ công
    ) NOT NULL,
    `reference_type` VARCHAR(50) NOT NULL COMMENT 'Tên bảng tham chiếu: purchase_orders, orders, return_orders...',
    `reference_id` BIGINT UNSIGNED NOT NULL COMMENT 'ID của chứng từ phát sinh',
    `quantity_change` DECIMAL(12, 3) NOT NULL COMMENT 'Lượng biến động (+ hoặc - tính theo đơn vị cơ sở)',
    `quantity_before` DECIMAL(12, 3) NOT NULL COMMENT 'Tồn kho trước biến động',
    `quantity_after` DECIMAL(12, 3) NOT NULL COMMENT 'Tồn kho sau biến động',
    `unit_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá vốn tại thời điểm biến động',
    `total_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá trị biến động = quantity_change * unit_cost',
    `user_id` BIGINT UNSIGNED NULL COMMENT 'Người thực hiện giao dịch',
    `note` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_im_prod_created` (`product_id`, `created_at`),
    INDEX `idx_im_ref` (`reference_type`, `reference_id`),
    INDEX `idx_im_type` (`movement_type`),
    CONSTRAINT `fk_im_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_im_unit` FOREIGN KEY (`base_unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_im_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Thẻ kho bất biến (Lịch sử biến động xuất nhập tồn)';

CREATE TABLE `inventory_checks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã phiếu kiểm kê KK0001...',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Người lập phiếu kiểm kê',
    `status` ENUM('DRAFT', 'BALANCED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT' COMMENT 'BALANCED: Đã cân bằng kho',
    `total_difference_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng giá trị chênh lệch (lời/lỗ do lệch tồn)',
    `note` TEXT NULL,
    `balanced_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm chốt cân bằng kho',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ic_code` (`code`),
    INDEX `idx_ic_user` (`user_id`),
    CONSTRAINT `fk_ic_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Phiếu kiểm kê hàng hóa định kỳ';

CREATE TABLE `inventory_check_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `inventory_check_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `base_unit_id` BIGINT UNSIGNED NOT NULL,
    `system_quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Tồn trên phần mềm trước kiểm',
    `actual_quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Tồn thực tế đếm được',
    `difference_quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Lệch = actual - system',
    `unit_cost` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá vốn thời điểm kiểm',
    `difference_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá trị lệch = diff_qty * unit_cost',
    `reason` VARCHAR(255) NULL COMMENT 'Lý do: Hết hạn, rách vỡ bao bì, nhầm lẫn...',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_icd_ic` (`inventory_check_id`),
    CONSTRAINT `fk_icd_ic` FOREIGN KEY (`inventory_check_id`) REFERENCES `inventory_checks` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_icd_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_icd_unit` FOREIGN KEY (`base_unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Chi tiết kiểm kê đếm hàng thực tế';

-- ------------------------------------------------------------------------------
-- 8. CA BÁN HÀNG (POS SHIFTS)
-- ------------------------------------------------------------------------------
CREATE TABLE `cashier_shifts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shift_code` VARCHAR(50) NOT NULL COMMENT 'Mã ca: CA-YYYYMMDD-01...',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Thu ngân nhận ca',
    `start_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm mở ca',
    `end_time` TIMESTAMP NULL DEFAULT NULL COMMENT 'Thời điểm chốt đóng ca',
    `starting_cash` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền mặt để lại đầu ca để thối lẻ',
    `cash_sales_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền mặt thu được từ các đơn trong ca',
    `bank_sales_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền chuyển khoản trong ca',
    `cash_payout_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Chi tiền mặt khẩn cấp trong ca (trả đá, mua túi...)',
    `expected_cash_end` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền mặt lý thuyết = Đầu ca + Thu TM - Chi TM',
    `actual_cash_end` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền mặt thực tế kiểm đếm khi giao ca',
    `difference_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Chênh lệch thừa/thiếu = actual - expected',
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `note` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_shift_code` (`shift_code`),
    INDEX `idx_shift_user` (`user_id`),
    INDEX `idx_shift_status` (`status`),
    CONSTRAINT `fk_shift_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Quản lý ca làm việc và két tiền của thu ngân';

-- ------------------------------------------------------------------------------
-- 9. KHUYẾN MÃI & CHIẾT KHẤU
-- ------------------------------------------------------------------------------
CREATE TABLE `promotions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `promo_type` ENUM(
        'DISCOUNT_PERCENT_ORDER',   -- Giảm % tổng đơn
        'DISCOUNT_AMOUNT_ORDER',    -- Giảm tiền tổng đơn
        'DISCOUNT_PERCENT_PRODUCT',  -- Giảm % theo sản phẩm
        'DISCOUNT_AMOUNT_PRODUCT',   -- Giảm tiền theo sản phẩm
        'BUY_X_GET_Y',              -- Mua X tặng Y
        'SAME_PRICE'                -- Đồng giá (VD: 10k)
    ) NOT NULL,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `min_order_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giá trị đơn tối thiểu để hưởng khuyến mãi',
    `min_quantity` DECIMAL(12, 3) NOT NULL DEFAULT 0.000 COMMENT 'Số lượng sản phẩm tối thiểu',
    `discount_value` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tỷ lệ % hoặc số tiền giảm',
    `max_discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Mức giảm tối đa nếu tính theo %',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_promo_code` (`code`),
    INDEX `idx_promo_dates` (`start_date`, `end_date`, `is_active`)
) ENGINE=InnoDB COMMENT='Chương trình khuyến mãi giảm giá tại quầy';

CREATE TABLE `promotion_targets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `promotion_id` BIGINT UNSIGNED NOT NULL,
    `target_type` ENUM('ALL', 'CATEGORY', 'PRODUCT', 'CUSTOMER_GROUP') NOT NULL,
    `target_id` BIGINT UNSIGNED NULL COMMENT 'ID của Category, Product hoặc CustomerGroup',
    PRIMARY KEY (`id`),
    INDEX `idx_pt_promo` (`promotion_id`),
    INDEX `idx_pt_target` (`target_type`, `target_id`),
    CONSTRAINT `fk_pt_promo` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Phạm vi áp dụng khuyến mãi';

-- ------------------------------------------------------------------------------
-- 10. BÁN HÀNG POS & TRẢ HÀNG KHÁCH HÀNG
-- ------------------------------------------------------------------------------
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã hóa đơn HD0001...',
    `shift_id` BIGINT UNSIGNED NULL COMMENT 'Ca làm việc ghi nhận đơn hàng này',
    `customer_id` BIGINT UNSIGNED NULL COMMENT 'NULL nếu là khách vãng lai/khách lẻ',
    `cashier_id` BIGINT UNSIGNED NOT NULL COMMENT 'Thu ngân đứng thanh toán',
    `seller_id` BIGINT UNSIGNED NULL COMMENT 'Nhân viên bán hàng (dùng tính hoa hồng)',
    `promotion_id` BIGINT UNSIGNED NULL COMMENT 'Chương trình KM áp dụng',
    `order_status` ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `payment_status` ENUM('PAID', 'PARTIAL', 'UNPAID') NOT NULL DEFAULT 'PAID',
    `subtotal_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền hàng trước chiết khấu',
    `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng giảm giá trên đơn',
    `tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Thuế VAT nếu có',
    `grand_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Khách phải trả = Subtotal - Discount + Tax',
    `paid_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền khách đã thanh toán',
    `change_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền thừa thối lại cho khách',
    `debt_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền nợ ghi vào sổ nợ khách hàng',
    `points_earned` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Điểm thưởng tích lũy đơn này',
    `points_redeemed` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Điểm thưởng đã dùng trừ tiền',
    `commission_total` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền hoa hồng cho nhân viên',
    `note` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_orders_code` (`code`),
    INDEX `idx_orders_customer` (`customer_id`),
    INDEX `idx_orders_cashier` (`cashier_id`),
    INDEX `idx_orders_seller` (`seller_id`),
    INDEX `idx_orders_shift` (`shift_id`),
    INDEX `idx_orders_created` (`created_at`),
    INDEX `idx_orders_status` (`order_status`, `payment_status`),
    CONSTRAINT `fk_ord_shift` FOREIGN KEY (`shift_id`) REFERENCES `cashier_shifts` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_ord_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_ord_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_ord_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_ord_promo` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Hóa đơn bán hàng lẻ tại quầy POS';

CREATE TABLE `order_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_unit_id` BIGINT UNSIGNED NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Số lượng bán theo quy cách',
    `unit_price` DECIMAL(15, 2) NOT NULL COMMENT 'Đơn giá bán tại thời điểm quét đơn',
    `cost_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Snapshot giá vốn tại thời điểm bán để tính lãi gộp',
    `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Giảm giá riêng trên từng sản phẩm',
    `subtotal` DECIMAL(15, 2) NOT NULL COMMENT 'Thành tiền = (quantity * unit_price) - discount',
    `conversion_rate` DECIMAL(12, 3) NOT NULL DEFAULT 1.000 COMMENT 'Snapshot tỷ lệ quy đổi ra đơn vị cơ sở',
    `base_quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Số lượng trừ kho = quantity * conversion_rate',
    `commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT '% hoa hồng nhân viên được nhận',
    `commission_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tiền hoa hồng cho món hàng này',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_od_order` (`order_id`),
    INDEX `idx_od_prod` (`product_id`),
    CONSTRAINT `fk_od_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_od_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_od_unit` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Chi tiết các mặt hàng trong hóa đơn bán hàng';

CREATE TABLE `order_payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `payment_method` ENUM('CASH', 'BANK_TRANSFER', 'EWALLET', 'DEBT') NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL COMMENT 'Số tiền thanh toán qua phương thức này',
    `reference_code` VARCHAR(100) NULL COMMENT 'Mã chuẩn chi POS thẻ hoặc mã giao dịch ngân hàng VietQR',
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_op_order` (`order_id`),
    INDEX `idx_op_method` (`payment_method`),
    CONSTRAINT `fk_op_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_op_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Chi tiết thanh toán hỗ trợ Split Payment (kết hợp tiền mặt + chuyển khoản)';

CREATE TABLE `return_orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL COMMENT 'Mã phiếu trả TH0001...',
    `original_order_id` BIGINT UNSIGNED NOT NULL COMMENT 'Tham chiếu hóa đơn gốc đã mua',
    `customer_id` BIGINT UNSIGNED NULL,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Thu ngân tiếp nhận trả hàng',
    `shift_id` BIGINT UNSIGNED NULL COMMENT 'Ca bán hàng xử lý chi tiền hoàn',
    `total_refund_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng số tiền hoàn lại',
    `refund_method` ENUM('CASH', 'BANK_TRANSFER', 'DEDUCT_DEBT') NOT NULL DEFAULT 'CASH',
    `debt_deduction` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền cấn trừ vào nợ cũ nếu có',
    `status` ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
    `reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ro_code` (`code`),
    INDEX `idx_ro_order` (`original_order_id`),
    INDEX `idx_ro_cust` (`customer_id`),
    CONSTRAINT `fk_ro_order` FOREIGN KEY (`original_order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_ro_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_ro_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_ro_shift` FOREIGN KEY (`shift_id`) REFERENCES `cashier_shifts` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Phiếu tiếp nhận khách hàng trả lại hàng';

CREATE TABLE `return_order_details` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `return_order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_unit_id` BIGINT UNSIGNED NOT NULL,
    `quantity` DECIMAL(12, 3) NOT NULL,
    `unit_price` DECIMAL(15, 2) NOT NULL COMMENT 'Đơn giá hoàn lại (theo giá lúc mua)',
    `subtotal` DECIMAL(15, 2) NOT NULL,
    `conversion_rate` DECIMAL(12, 3) NOT NULL DEFAULT 1.000,
    `base_quantity` DECIMAL(12, 3) NOT NULL COMMENT 'Số lượng cộng lại vào kho',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_rod_ro` (`return_order_id`),
    CONSTRAINT `fk_rod_ro` FOREIGN KEY (`return_order_id`) REFERENCES `return_orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rod_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_rod_unit` FOREIGN KEY (`product_unit_id`) REFERENCES `product_units` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Chi tiết mặt hàng khách mang đến trả';

-- ------------------------------------------------------------------------------
-- 11. QUẢN LÝ SỔ NỢ (CÔNG NỢ ĐỐI SOÁT CHI TIẾT)
-- ------------------------------------------------------------------------------
CREATE TABLE `customer_debts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `transaction_type` ENUM(
        'ORDER_DEBT',        -- Phát sinh nợ khi mua nợ đơn hàng (+)
        'DEBT_REPAYMENT',    -- Khách mang tiền đến trả nợ (-)
        'RETURN_DEDUCTION',  -- Giảm nợ do khách trả lại hàng (-)
        'MANUAL_ADJUST'      -- Điều chỉnh công nợ
    ) NOT NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `return_order_id` BIGINT UNSIGNED NULL,
    `amount` DECIMAL(15, 2) NOT NULL COMMENT 'Số tiền phát sinh trong giao dịch',
    `balance_after` DECIMAL(15, 2) NOT NULL COMMENT 'Dư nợ sau giao dịch để đối soát tức thì',
    `due_date` DATE NULL COMMENT 'Hạn chót phải trả tiền',
    `recorded_by` BIGINT UNSIGNED NOT NULL COMMENT 'Nhân viên thu tiền/ghi nợ',
    `payment_method` ENUM('CASH', 'BANK_TRANSFER', 'OTHER') NULL,
    `note` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_cd_customer_created` (`customer_id`, `created_at`),
    INDEX `idx_cd_order` (`order_id`),
    CONSTRAINT `fk_cd_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_cd_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_cd_ro` FOREIGN KEY (`return_order_id`) REFERENCES `return_orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_cd_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Sổ công nợ chi tiết của từng khách hàng';

CREATE TABLE `supplier_debts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `supplier_id` BIGINT UNSIGNED NOT NULL,
    `transaction_type` ENUM(
        'PURCHASE_DEBT',     -- Phát sinh nợ khi nhập hàng nợ (+)
        'DEBT_PAYMENT',      -- Quán trả tiền cho NCC (-)
        'RETURN_DEDUCTION',  -- Giảm nợ do trả lại hàng cho NCC (-)
        'MANUAL_ADJUST'      -- Điều chỉnh công nợ
    ) NOT NULL,
    `purchase_order_id` BIGINT UNSIGNED NULL,
    `purchase_return_id` BIGINT UNSIGNED NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `balance_after` DECIMAL(15, 2) NOT NULL COMMENT 'Dư nợ sau khi giao dịch',
    `due_date` DATE NULL COMMENT 'Hạn thanh toán nhà cung cấp giao kết',
    `recorded_by` BIGINT UNSIGNED NOT NULL,
    `payment_method` ENUM('CASH', 'BANK_TRANSFER', 'OTHER') NULL,
    `note` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_sd_supp_created` (`supplier_id`, `created_at`),
    INDEX `idx_sd_po` (`purchase_order_id`),
    CONSTRAINT `fk_sd_supp` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_sd_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_sd_pr` FOREIGN KEY (`purchase_return_id`) REFERENCES `purchase_returns` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_sd_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB COMMENT='Sổ công nợ chi tiết với nhà cung cấp';

-- ------------------------------------------------------------------------------
-- 12. HOA HỒNG NHÂN VIÊN (DOANH SỐ & KPI)
-- ------------------------------------------------------------------------------
CREATE TABLE `commission_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT UNSIGNED NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `commission_type` ENUM('PERCENT_ORDER', 'FIXED_PER_ORDER', 'PERCENT_PROFIT') NOT NULL,
    `rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Tỷ lệ % hoặc số tiền cố định',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_cs_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Cấu hình chính sách hoa hồng cho nhân viên bán hàng';

CREATE TABLE `employee_commissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `order_detail_id` BIGINT UNSIGNED NULL,
    `amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 COMMENT 'Số tiền hoa hồng được nhận',
    `status` ENUM('PENDING', 'APPROVED', 'PAID') NOT NULL DEFAULT 'PENDING',
    `paid_at` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_ec_user` (`user_id`),
    INDEX `idx_ec_order` (`order_id`),
    CONSTRAINT `fk_ec_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_ec_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ec_od` FOREIGN KEY (`order_detail_id`) REFERENCES `order_details` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='Bảng ghi nhận tiền thưởng hoa hồng thực tế trên từng đơn';

-- Bật lại kiểm tra khóa ngoại sau khi hoàn tất tạo bảng
SET FOREIGN_KEY_CHECKS = 1;
