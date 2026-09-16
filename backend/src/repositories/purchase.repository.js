const { pool } = require('../config/database');

class PurchaseRepository {
  async findAll({ keyword, supplierId, status, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = '1=1';

    if (keyword) {
      whereClause += ' AND (po.code LIKE ? OR s.name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (supplierId) {
      whereClause += ' AND po.supplier_id = ?';
      params.push(supplierId);
    }
    if (status) {
      whereClause += ' AND po.status = ?';
      params.push(status);
    }

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM purchase_orders po 
      INNER JOIN suppliers s ON po.supplier_id = s.id 
      WHERE ${whereClause}
    `;
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    const query = `
      SELECT po.*, s.name AS supplier_name, s.phone AS supplier_phone, u.full_name AS staff_name
      FROM purchase_orders po
      INNER JOIN suppliers s ON po.supplier_id = s.id
      INNER JOIN users u ON po.user_id = u.id
      WHERE ${whereClause}
      ORDER BY po.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const query = `
      SELECT po.*, s.name AS supplier_name, s.phone AS supplier_phone, s.address AS supplier_address,
             u.full_name AS staff_name
      FROM purchase_orders po
      INNER JOIN suppliers s ON po.supplier_id = s.id
      INNER JOIN users u ON po.user_id = u.id
      WHERE po.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows[0]) return null;

    const [details] = await pool.query(
      `SELECT pod.*, p.name AS product_name, p.code AS product_code, u.name AS unit_name
       FROM purchase_order_details pod
       INNER JOIN products p ON pod.product_id = p.id
       INNER JOIN product_units pu ON pod.product_unit_id = pu.id
       INNER JOIN units u ON pu.unit_id = u.id
       WHERE pod.purchase_order_id = ?`,
      [id]
    );

    return {
      ...rows[0],
      items: details,
    };
  }

  async createPurchaseTransaction(connection, data) {
    const {
      code,
      supplierId,
      userId,
      subtotalAmount,
      discountAmount,
      taxAmount,
      grandTotal,
      paidAmount,
      debtAmount,
      note,
      items,
    } = data;

    // 1. Tạo phiếu nhập
    const [poResult] = await connection.query(
      `INSERT INTO purchase_orders (code, supplier_id, user_id, status, subtotal_amount, discount_amount, tax_amount, grand_total, paid_amount, debt_amount, note)
       VALUES (?, ?, ?, 'COMPLETED', ?, ?, ?, ?, ?, ?, ?)`,
      [code, supplierId, userId, subtotalAmount, discountAmount || 0, taxAmount || 0, grandTotal, paidAmount || 0, debtAmount || 0, note || null]
    );
    const purchaseOrderId = poResult.insertId;

    // 2. Tạo chi tiết phiếu nhập, tăng tồn kho và ghi thẻ kho
    for (const item of items) {
      const baseQuantity = item.quantity * item.conversionRate;
      const subtotal = item.quantity * item.unitPrice - (item.discountAmount || 0);

      await connection.query(
        `INSERT INTO purchase_order_details (purchase_order_id, product_id, product_unit_id, quantity, unit_price, discount_amount, subtotal, conversion_rate, base_quantity, batch_number, expiry_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseOrderId,
          item.productId,
          item.productUnitId,
          item.quantity,
          item.unitPrice,
          item.discountAmount || 0,
          subtotal,
          item.conversionRate,
          baseQuantity,
          item.batchNumber || null,
          item.expiryDate || null,
        ]
      );

      // Lấy tồn kho trước
      const [stockRows] = await connection.query(
        'SELECT quantity_on_hand FROM inventory_stocks WHERE product_id = ? FOR UPDATE',
        [item.productId]
      );
      const qtyBefore = stockRows[0] ? parseFloat(stockRows[0].quantity_on_hand) : 0;
      const qtyAfter = qtyBefore + baseQuantity;

      // Cập nhật tồn kho
      await connection.query(
        `UPDATE inventory_stocks 
         SET quantity_on_hand = quantity_on_hand + ?, last_cost_price = ?
         WHERE product_id = ?`,
        [baseQuantity, item.unitPrice / item.conversionRate, item.productId]
      );

      // Ghi nhận thẻ kho bất biến
      await connection.query(
        `INSERT INTO inventory_movements (product_id, base_unit_id, movement_type, reference_type, reference_id, quantity_change, quantity_before, quantity_after, unit_cost, total_value, user_id, note)
         SELECT ?, p.base_unit_id, 'PURCHASE_IMPORT', 'purchase_orders', ?, ?, ?, ?, ?, ?, ?, ?
         FROM products p WHERE p.id = ?`,
        [
          item.productId,
          purchaseOrderId,
          baseQuantity,
          qtyBefore,
          qtyAfter,
          item.unitPrice / item.conversionRate,
          baseQuantity * (item.unitPrice / item.conversionRate),
          userId,
          `Nhập hàng theo đơn ${code}`,
          item.productId,
        ]
      );
    }

    // 3. Nếu còn nợ nhà cung cấp -> Ghi sổ nợ và tăng công nợ hiện tại
    if (debtAmount > 0) {
      const [suppRows] = await connection.query(
        'SELECT current_debt FROM suppliers WHERE id = ? FOR UPDATE',
        [supplierId]
      );
      const currentDebt = parseFloat(suppRows[0]?.current_debt || 0);
      const balanceAfter = currentDebt + debtAmount;

      await connection.query(
        `INSERT INTO supplier_debts (supplier_id, purchase_order_id, transaction_type, amount, balance_after, recorded_by, note)
         VALUES (?, ?, 'PURCHASE_DEBT', ?, ?, ?, ?)`,
        [supplierId, purchaseOrderId, debtAmount, balanceAfter, userId, `Phát sinh nợ từ đơn nhập ${code}`]
      );

      await connection.query(
        'UPDATE suppliers SET current_debt = current_debt + ? WHERE id = ?',
        [debtAmount, supplierId]
      );
    }

    return purchaseOrderId;
  }

  async createPurchaseReturnTransaction(connection, data) {
    const { code, purchaseOrderId, supplierId, userId, items, totalAmount, refundAmount, debtDeduction, reason } = data;

    const [prResult] = await connection.query(
      `INSERT INTO purchase_returns (code, purchase_order_id, supplier_id, user_id, total_amount, refund_amount, debt_deduction, status, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?)`,
      [code, purchaseOrderId || null, supplierId, userId, totalAmount, refundAmount || 0, debtDeduction || 0, reason || null]
    );
    const returnId = prResult.insertId;

    for (const item of items) {
      const baseQuantity = item.quantity * item.conversionRate;
      const subtotal = item.quantity * item.unitPrice;

      await connection.query(
        `INSERT INTO purchase_return_details (purchase_return_id, product_id, product_unit_id, quantity, unit_price, subtotal, conversion_rate, base_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [returnId, item.productId, item.productUnitId, item.quantity, item.unitPrice, subtotal, item.conversionRate, baseQuantity]
      );

      const [stockRows] = await connection.query(
        'SELECT quantity_on_hand FROM inventory_stocks WHERE product_id = ? FOR UPDATE',
        [item.productId]
      );
      const qtyBefore = stockRows[0] ? parseFloat(stockRows[0].quantity_on_hand) : 0;
      if (qtyBefore < baseQuantity) {
        throw new Error(`Tồn kho không đủ để xuất trả nhà cung cấp mặt hàng ID: ${item.productId}`);
      }
      const qtyAfter = qtyBefore - baseQuantity;

      await connection.query(
        'UPDATE inventory_stocks SET quantity_on_hand = quantity_on_hand - ? WHERE product_id = ?',
        [baseQuantity, item.productId]
      );

      await connection.query(
        `INSERT INTO inventory_movements (product_id, base_unit_id, movement_type, reference_type, reference_id, quantity_change, quantity_before, quantity_after, unit_cost, total_value, user_id, note)
         SELECT ?, p.base_unit_id, 'PURCHASE_RETURN', 'purchase_returns', ?, ?, ?, ?, ?, ?, ?, ?
         FROM products p WHERE p.id = ?`,
        [item.productId, returnId, -baseQuantity, qtyBefore, qtyAfter, item.unitPrice / item.conversionRate, baseQuantity * (item.unitPrice / item.conversionRate), userId, `Trả hàng NCC theo phiếu ${code}`, item.productId]
      );
    }

    if (debtDeduction > 0) {
      const [suppRows] = await connection.query('SELECT current_debt FROM suppliers WHERE id = ? FOR UPDATE', [supplierId]);
      const currentDebt = parseFloat(suppRows[0]?.current_debt || 0);
      const balanceAfter = Math.max(0, currentDebt - debtDeduction);

      await connection.query(
        `INSERT INTO supplier_debts (supplier_id, purchase_return_id, transaction_type, amount, balance_after, recorded_by, note)
         VALUES (?, ?, 'RETURN_DEDUCTION', ?, ?, ?, ?)`,
        [supplierId, returnId, -debtDeduction, balanceAfter, userId, `Giảm nợ do xuất trả hàng ${code}`]
      );

      await connection.query('UPDATE suppliers SET current_debt = ? WHERE id = ?', [balanceAfter, supplierId]);
    }

    return returnId;
  }
}

module.exports = new PurchaseRepository();
