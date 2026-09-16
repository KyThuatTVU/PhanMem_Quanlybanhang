-- ==============================================================================
-- SEED DATA: DỮ LIỆU MẪU CHO CỬA HÀNG TẠP HÓA QUY MÔ VỪA
-- DBMS: MySQL 8.x
-- ==============================================================================

USE `grocery_store_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Cấu hình hệ thống
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`, `data_type`) VALUES
('STORE_NAME', 'Tạp Hóa & Siêu Thị Mini An Khang', 'Tên cửa hàng in trên hóa đơn', 'STRING'),
('STORE_PHONE', '0987654321', 'Hotline cửa hàng', 'STRING'),
('STORE_ADDRESS', 'Số 123 Đường Nguyễn Văn Linh, P. Tân Thuận, Quận 7, TP.HCM', 'Địa chỉ cửa hàng', 'STRING'),
('INVOICE_FOOTER', 'Cảm ơn quý khách và hẹn gặp lại! Hàng mua được đổi trả trong vòng 3 ngày.', 'Lời chào chân trang bill', 'STRING'),
('POINTS_EXCHANGE_RATE', '1000', '1 điểm thưởng tương đương 1.000 VNĐ khi thanh toán', 'NUMBER');

-- 2. Đơn vị tính cơ sở & quy cách
INSERT INTO `units` (`id`, `name`) VALUES
(1, 'Chai'),
(2, 'Lon'),
(3, 'Gói'),
(4, 'Hộp'),
(5, 'Thùng'),
(6, 'Lốc'),
(7, 'Kg'),
(8, 'Bao');

-- 3. Vai trò & Quyền hạn
INSERT INTO `roles` (`id`, `code`, `name`, `description`) VALUES
(1, 'ADMIN', 'Chủ cửa hàng / Quản trị tối cao', 'Toàn quyền kiểm soát và cấu hình hệ thống'),
(2, 'MANAGER', 'Quản lý cửa hàng', 'Quản lý kho, nhập hàng, giá bán, xem báo cáo'),
(3, 'CASHIER', 'Thu ngân POS', 'Thực hiện bán lẻ tại quầy, mở/đóng ca, in bill'),
(4, 'WAREHOUSE', 'Nhân viên kho', 'Kiểm kê, nhập xuất và điều chỉnh kho hàng');

INSERT INTO `permissions` (`code`, `name`, `module`) VALUES
('PRODUCT_VIEW', 'Xem danh sách sản phẩm', 'PRODUCTS'),
('PRODUCT_MANAGE', 'Thêm/Sửa/Xóa sản phẩm', 'PRODUCTS'),
('PRICE_UPDATE', 'Điều chỉnh giá bán/nhập', 'PRODUCTS'),
('POS_SELL', 'Bán hàng tại quầy POS', 'POS'),
('ORDER_CANCEL', 'Hủy hóa đơn bán lẻ', 'POS'),
('RETURN_PROCESS', 'Tiếp nhận trả hàng', 'RETURNS'),
('INVENTORY_VIEW', 'Xem tồn kho', 'INVENTORY'),
('INVENTORY_ADJUST', 'Cân bằng/Điều chỉnh tồn kho', 'INVENTORY'),
('PURCHASE_MANAGE', 'Lập và quản lý phiếu nhập hàng', 'PURCHASE'),
('DEBT_COLLECT', 'Thu công nợ khách hàng', 'DEBT'),
('REPORT_VIEW', 'Xem báo cáo doanh thu & lãi gộp', 'REPORTS');

-- Gán toàn quyền cho ADMIN (Role 1)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

-- Gán quyền cho Thu ngân (Role 3)
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 3, id FROM `permissions` WHERE `code` IN ('PRODUCT_VIEW', 'POS_SELL', 'RETURN_PROCESS');

-- 4. Tài khoản nhân viên & Admin Google Login
-- Mật khẩu mặc định hash '123456' ($2b$10$wN16lq2P.X3M2K9r4xJkYeK9Yk27r6bKev2eQ1fB6l7R5/aWnC.wW)
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `email`, `phone`, `google_id`, `auth_provider`, `is_active`) VALUES
(1, 'admin', '$2b$10$wN16lq2P.X3M2K9r4xJkYeK9Yk27r6bKev2eQ1fB6l7R5/aWnC.wW', 'Nguyễn Văn Chủ Quán', 'admin.ankhang@gmail.com', '0901112233', '109823471829374829102', 'GOOGLE', 1),
(2, 'thungan01', '$2b$10$wN16lq2P.X3M2K9r4xJkYeK9Yk27r6bKev2eQ1fB6l7R5/aWnC.wW', 'Trần Thị Thu Ngân', 'thungan01@ankhang.vn', '0902223344', NULL, 'LOCAL', 1),
(3, 'kho01', '$2b$10$wN16lq2P.X3M2K9r4xJkYeK9Yk27r6bKev2eQ1fB6l7R5/aWnC.wW', 'Lê Văn Kho', 'kho01@ankhang.vn', '0903334455', NULL, 'LOCAL', 1);

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 3),
(3, 4);

-- 5. Danh mục ngành hàng & Thương hiệu
INSERT INTO `categories` (`id`, `code`, `name`) VALUES
(1, 'CAT_BEVERAGE', 'Nước giải khát & Bia'),
(2, 'CAT_SNACK', 'Bánh kẹo & Snack'),
(3, 'CAT_SPICE', 'Gia vị & Đồ khô'),
(4, 'CAT_MILK', 'Sữa & Sản phẩm từ sữa'),
(5, 'CAT_RICE', 'Gạo & Ngũ cốc');

INSERT INTO `brands` (`id`, `code`, `name`) VALUES
(1, 'COCACOLA', 'Coca-Cola'),
(2, 'PEPSI', 'PepsiCo'),
(3, 'VINAMILK', 'Vinamilk'),
(4, 'MASAN', 'Masan Consumer'),
(5, 'OISHI', 'Oishi Liwayway');

-- 6. Danh mục sản phẩm gốc (Đơn vị tính cơ sở)
INSERT INTO `products` (`id`, `code`, `sku`, `name`, `category_id`, `brand_id`, `base_unit_id`, `allow_decimal`, `min_stock_alert`, `max_stock_alert`) VALUES
(1, 'SP0001', 'SKU-COCA-330', 'Nước ngọt Coca-Cola 330ml', 1, 1, 2, 0, 24.000, 500.000),     -- base unit: Lon
(2, 'SP0002', 'SKU-VNM-180', 'Sữa chua uống Vinamilk 180ml', 4, 3, 4, 0, 20.000, 300.000),   -- base unit: Hộp
(3, 'SP0003', 'SKU-CHM-OT250', 'Tương ớt Cholimex chai 250g', 3, 4, 1, 0, 10.000, 100.000), -- base unit: Chai
(4, 'SP0004', 'SKU-GAO-ST25', 'Gạo thơm ST25 Ông Cua', 5, NULL, 7, 1, 50.000, 1000.000);     -- base unit: Kg

-- 7. Quy cách đơn vị & Bảng giá (Unit conversions & Prices)
-- SP0001 (Coca-Cola): Lon (base=1), Lốc (6 lon), Thùng (24 lon)
INSERT INTO `product_units` (`id`, `product_id`, `unit_id`, `conversion_rate`, `is_base_unit`, `cost_price`, `retail_price`, `wholesale_price`) VALUES
(1, 1, 2, 1.000, 1, 8500.00, 11000.00, 10000.00),     -- Lon
(2, 1, 6, 6.000, 0, 51000.00, 64000.00, 60000.00),    -- Lốc (6 lon)
(3, 1, 5, 24.000, 0, 200000.00, 250000.00, 235000.00); -- Thùng (24 lon)

-- SP0002 (Sữa Vinamilk): Hộp (base=1), Lốc (4 hộp), Thùng (48 hộp)
INSERT INTO `product_units` (`id`, `product_id`, `unit_id`, `conversion_rate`, `is_base_unit`, `cost_price`, `retail_price`, `wholesale_price`) VALUES
(4, 2, 4, 1.000, 1, 6500.00, 8500.00, 8000.00),       -- Hộp
(5, 2, 6, 4.000, 0, 26000.00, 33000.00, 31000.00),    -- Lốc (4 hộp)
(6, 2, 5, 48.000, 0, 310000.00, 390000.00, 370000.00); -- Thùng (48 hộp)

-- SP0003 (Tương ớt Cholimex): Chai (base=1)
INSERT INTO `product_units` (`id`, `product_id`, `unit_id`, `conversion_rate`, `is_base_unit`, `cost_price`, `retail_price`, `wholesale_price`) VALUES
(7, 3, 1, 1.000, 1, 9500.00, 13000.00, 11500.00);

-- SP0004 (Gạo ST25): Kg (base=1), Bao 25kg (25kg)
INSERT INTO `product_units` (`id`, `product_id`, `unit_id`, `conversion_rate`, `is_base_unit`, `cost_price`, `retail_price`, `wholesale_price`) VALUES
(8, 4, 7, 1.000, 1, 28000.00, 36000.00, 33000.00),     -- Kg lẻ
(9, 4, 8, 25.000, 0, 690000.00, 875000.00, 820000.00); -- Bao 25kg

-- 8. Mã vạch Barcodes (Quét ra đúng đơn vị)
INSERT INTO `product_barcodes` (`product_id`, `product_unit_id`, `barcode`, `is_default`) VALUES
(1, 1, '8934560111118', 1), -- Quét mã này ra 1 Lon Coca
(1, 2, '8934560111125', 1), -- Quét mã này ra 1 Lốc Coca 6 lon
(1, 3, '8934560111132', 1), -- Quét mã này ra 1 Thùng Coca 24 lon
(2, 4, '8935049500012', 1), -- 1 Hộp sữa Vinamilk
(2, 5, '8935049500029', 1), -- 1 Lốc sữa Vinamilk
(3, 7, '8935012300055', 1), -- 1 Chai tương ớt
(4, 9, '8936008889991', 1); -- 1 Bao Gạo ST25 25kg

-- 9. Tồn kho hiện tại (Inventory Stocks theo Base Unit)
INSERT INTO `inventory_stocks` (`product_id`, `base_unit_id`, `quantity_on_hand`, `last_cost_price`) VALUES
(1, 2, 240.000, 8500.00), -- 240 lon Coca (tương đương 10 thùng)
(2, 4, 192.000, 6500.00), -- 192 hộp sữa (tương đương 4 thùng)
(3, 1, 48.000, 9500.00),  -- 48 chai tương ớt
(4, 7, 250.000, 28000.00); -- 250 kg gạo (tương đương 10 bao)

-- 10. Nhà cung cấp
INSERT INTO `suppliers` (`id`, `code`, `name`, `contact_name`, `phone`, `address`, `current_debt`) VALUES
(1, 'NCC001', 'Công ty TNHH NGK Coca-Cola Việt Nam', 'Nguyễn Hữu Sang', '02838960000', 'Xa Lộ Hà Nội, Linh Trung, TP. Thủ Đức', 5000000.00),
(2, 'NCC002', 'Công ty Cổ phần Sữa Việt Nam (Vinamilk)', 'Đặng Thu Thảo', '02854155555', 'Số 10 Tân Trào, P. Tân Phú, Quận 7, TP.HCM', 0.00);

-- 11. Nhóm khách hàng & Khách hàng
INSERT INTO `customer_groups` (`id`, `code`, `name`, `discount_rate`) VALUES
(1, 'RETAIL', 'Khách mua lẻ vãng lai', 0.00),
(2, 'LOYAL', 'Khách hàng thân thiết', 2.00),
(3, 'WHOLESALE', 'Khách mua sỉ / Bếp ăn / Quán cơm', 5.00);

INSERT INTO `customers` (`id`, `group_id`, `code`, `name`, `phone`, `loyalty_points`, `current_debt`, `debt_limit`) VALUES
(1, 1, 'KH0000', 'Khách Lẻ Tại Quầy', '0000000000', 0, 0.00, 0.00),
(2, 2, 'KH0001', 'Chị Lan Tạp Hóa Xóm', '0918112233', 150, 0.00, 2000000.00),
(3, 3, 'KH0002', 'Quán Cơm Bình Dân Số 8', '0988776655', 420, 1500000.00, 10000000.00);

-- 12. Ca làm việc đầu ngày của Thu ngân
INSERT INTO `cashier_shifts` (`id`, `shift_code`, `user_id`, `start_time`, `starting_cash`, `cash_sales_amount`, `bank_sales_amount`, `expected_cash_end`, `actual_cash_end`, `difference_amount`, `status`) VALUES
(1, 'CA-20260915-01', 2, '2026-09-15 06:30:00', 1000000.00, 0.00, 0.00, 1000000.00, 0.00, 0.00, 'OPEN');

-- 13. Mẫu một đơn hàng hoàn chỉnh (Khách mua 1 Thùng Coca + 2 Lốc Sữa Vinamilk, thanh toán kết hợp tiền mặt + chuyển khoản)
INSERT INTO `orders` (
    `id`, `code`, `shift_id`, `customer_id`, `cashier_id`, `seller_id`,
    `order_status`, `payment_status`, `subtotal_amount`, `discount_amount`,
    `grand_total`, `paid_amount`, `change_amount`, `debt_amount`, `points_earned`
) VALUES (
    1, 'HD20260915-001', 1, 2, 2, 2,
    'COMPLETED', 'PAID', 316000.00, 6000.00,
    310000.00, 310000.00, 0.00, 0.00, 3
);

-- Chi tiết đơn hàng:
-- Dòng 1: 1 Thùng Coca (unit_id=5, conversion_rate=24 -> base_quantity=24 lon)
INSERT INTO `order_details` (
    `order_id`, `product_id`, `product_unit_id`, `quantity`, `unit_price`,
    `cost_price`, `discount_amount`, `subtotal`, `conversion_rate`, `base_quantity`
) VALUES (
    1, 1, 3, 1.000, 250000.00,
    200000.00, 0.00, 250000.00, 24.000, 24.000
);

-- Dòng 2: 2 Lốc sữa Vinamilk (unit_id=6, conversion_rate=4 -> base_quantity=8 hộp)
INSERT INTO `order_details` (
    `order_id`, `product_id`, `product_unit_id`, `quantity`, `unit_price`,
    `cost_price`, `discount_amount`, `subtotal`, `conversion_rate`, `base_quantity`
) VALUES (
    1, 2, 5, 2.000, 33000.00,
    26000.00, 0.00, 66000.00, 4.000, 8.000
);

-- Thanh toán phân tách (Split Payment): 200.000 tiền mặt + 110.000 chuyển khoản VietQR
INSERT INTO `order_payments` (`order_id`, `payment_method`, `amount`, `reference_code`, `created_by`) VALUES
(1, 'CASH', 200000.00, NULL, 2),
(1, 'BANK_TRANSFER', 110000.00, 'MB-FT2625890012', 2);

-- Ghi thẻ kho biến động trừ hàng tự động
INSERT INTO `inventory_movements` (
    `product_id`, `base_unit_id`, `movement_type`, `reference_type`, `reference_id`,
    `quantity_change`, `quantity_before`, `quantity_after`, `unit_cost`, `total_value`, `user_id`
) VALUES
(1, 2, 'SALE_EXPORT', 'orders', 1, -24.000, 240.000, 216.000, 8500.00, 204000.00, 2),
(2, 4, 'SALE_EXPORT', 'orders', 1, -8.000, 192.000, 184.000, 6500.00, 52000.00, 2);

-- Cập nhật lại tồn thực tế
UPDATE `inventory_stocks` SET `quantity_on_hand` = 216.000 WHERE `product_id` = 1;
UPDATE `inventory_stocks` SET `quantity_on_hand` = 184.000 WHERE `product_id` = 2;

-- Cập nhật lũy kế doanh thu ca bán hàng
UPDATE `cashier_shifts` 
SET `cash_sales_amount` = `cash_sales_amount` + 200000.00,
    `bank_sales_amount` = `bank_sales_amount` + 110000.00,
    `expected_cash_end` = `expected_cash_end` + 200000.00
WHERE `id` = 1;

SET FOREIGN_KEY_CHECKS = 1;
