const { pool } = require('../config/database');

class ProductRepository {
  /**
    Tìm danh sách sản phẩm có Phân trang, Tìm kiếm, Lọc Ngành hàng & Thương hiệu
   */
  async findAll({ keyword, categoryId, brandId, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereConditions = ['p.deleted_at IS NULL'];

    if (keyword) {
      whereConditions.push('(p.name LIKE ? OR p.code LIKE ? OR p.sku LIKE ? OR pb.barcode LIKE ?)');
      const searchKeyword = `%${keyword}%`;
      params.push(searchKeyword, searchKeyword, searchKeyword, searchKeyword);
    }

    if (categoryId) {
      whereConditions.push('p.category_id = ?');
      params.push(categoryId);
    }

    if (brandId) {
      whereConditions.push('p.brand_id = ?');
      params.push(brandId);
    }

    const whereClause = whereConditions.join(' AND ');

    // Truy vấn tổng số dòng
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM products p
      LEFT JOIN product_barcodes pb ON p.id = pb.product_id
      WHERE ${whereClause}
    `;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    // Truy vấn lấy dữ liệu kèm Đơn vị tính cơ sở và Tồn kho hiện tại
    const dataQuery = `
      SELECT DISTINCT
        p.id, p.code, p.sku, p.name, p.allow_decimal, p.min_stock_alert, p.is_active,
        c.name AS category_name, b.name AS brand_name, u.name AS base_unit_name,
        COALESCE(inv.quantity_on_hand, 0) AS quantity_on_hand,
        (SELECT file_url FROM media_files mf 
         INNER JOIN product_images pi ON mf.id = pi.media_id 
         WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) AS primary_image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      INNER JOIN units u ON p.base_unit_id = u.id
      LEFT JOIN inventory_stocks inv ON p.id = inv.product_id
      LEFT JOIN product_barcodes pb ON p.id = pb.product_id
      WHERE ${whereClause}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataQuery, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return { rows, total };
  }

  /**
    Tìm sản phẩm theo Mã Vạch (BarCode Scan phục vụ máy quét POS)
   */
  async findByBarcode(barcode) {
    const query = `
      SELECT 
        p.id AS product_id, p.code AS product_code, p.name AS product_name, p.allow_decimal,
        pu.id AS product_unit_id, u.name AS unit_name, pu.conversion_rate, pu.retail_price, pu.cost_price,
        pb.barcode, inv.quantity_on_hand
      FROM product_barcodes pb
      INNER JOIN product_units pu ON pb.product_unit_id = pu.id
      INNER JOIN products p ON pb.product_id = p.id
      INNER JOIN units u ON pu.unit_id = u.id
      LEFT JOIN inventory_stocks inv ON p.id = inv.product_id
      WHERE pb.barcode = ? AND p.is_active = 1 AND p.deleted_at IS NULL
      LIMIT 1
    `;
    const [rows] = await pool.query(query, [barcode]);
    return rows[0] || null;
  }

  /**
    Xem chi tiết Sản phẩm kèm tất cả đơn vị quy đổi và mã vạch
   */
  async findById(productId) {
    const query = `
      SELECT p.*, c.name AS category_name, b.name AS brand_name, u.name AS base_unit_name,
             inv.quantity_on_hand
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      INNER JOIN units u ON p.base_unit_id = u.id
      LEFT JOIN inventory_stocks inv ON p.id = inv.product_id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `;
    const [rows] = await pool.query(query, [productId]);
    if (!rows[0]) return null;

    const product = rows[0];

    // Lấy danh sách quy cách đơn vị tính
    const [units] = await pool.query(
      `SELECT pu.*, u.name AS unit_name 
       FROM product_units pu 
       INNER JOIN units u ON pu.unit_id = u.id 
       WHERE pu.product_id = ?`,
      [productId]
    );

    // Lấy danh sách mã vạch
    const [barcodes] = await pool.query('SELECT * FROM product_barcodes WHERE product_id = ?', [productId]);

    // Lấy danh sách hình ảnh
    const [images] = await pool.query(
      `SELECT pi.id, pi.is_primary, mf.file_url, mf.original_name
       FROM product_images pi
       INNER JOIN media_files mf ON pi.media_id = mf.id
       WHERE pi.product_id = ?`,
      [productId]
    );

    return {
      ...product,
      units,
      barcodes,
      images,
    };
  }

  /**
    Tạo sản phẩm hoàn chỉnh trong Transaction
   */
  async createProductWithUnits(connection, productData, unitConversions) {
    const { code, sku, name, categoryId, brandId, baseUnitId, allowDecimal, minStockAlert, description } = productData;

    // 1. Insert bảng products
    const [prodResult] = await connection.query(
      `INSERT INTO products (code, sku, name, category_id, brand_id, base_unit_id, allow_decimal, min_stock_alert, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, sku, name, categoryId, brandId, baseUnitId, allowDecimal ? 1 : 0, minStockAlert || 0, description || null]
    );
    const productId = prodResult.insertId;

    // 2. Tự động tạo bản ghi tồn kho ban đầu = 0
    await connection.query(
      `INSERT INTO inventory_stocks (product_id, base_unit_id, quantity_on_hand) VALUES (?, ?, 0.000)`,
      [productId, baseUnitId]
    );

    // 3. Insert các quy cách đơn vị tính và mã vạch
    for (const unitItem of unitConversions) {
      const [unitResult] = await connection.query(
        `INSERT INTO product_units (product_id, unit_id, conversion_rate, is_base_unit, cost_price, retail_price, wholesale_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          unitItem.unitId,
          unitItem.conversionRate,
          unitItem.isBaseUnit ? 1 : 0,
          unitItem.costPrice || 0,
          unitItem.retailPrice || 0,
          unitItem.wholesalePrice || 0,
        ]
      );
      const productUnitId = unitResult.insertId;

      if (unitItem.barcode) {
        await connection.query(
          `INSERT INTO product_barcodes (product_id, product_unit_id, barcode, is_default) VALUES (?, ?, ?, 1)`,
          [productId, productUnitId, unitItem.barcode]
        );
      }
    }

    return productId;
  }

  /**
    Lưu Metadata ảnh sản phẩm đã upload
   */
  async addProductImage({ productId, originalName, storedName, filePath, fileUrl, mimeType, fileSize, createdBy }) {
    // 1. Ghi bảng media_files
    const [mediaResult] = await pool.query(
      `INSERT INTO media_files (original_name, stored_name, file_path, file_url, mime_type, file_size, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [originalName, storedName, filePath, fileUrl, mimeType, fileSize, createdBy]
    );
    const mediaId = mediaResult.insertId;

    // 2. Ghi bảng product_images
    await pool.query(
      `INSERT INTO product_images (product_id, media_id, is_primary) VALUES (?, ?, 1)`,
      [productId, mediaId]
    );

    return { mediaId, fileUrl };
  }
}

module.exports = new ProductRepository();
