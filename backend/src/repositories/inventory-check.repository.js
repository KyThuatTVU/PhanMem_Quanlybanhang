const { pool } = require('../config/database');

class InventoryCheckRepository {
  async findAll({ page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    const countQuery = 'SELECT COUNT(*) AS total FROM inventory_checks';
    const [countRows] = await pool.query(countQuery);
    const total = countRows[0].total;

    const query = `
      SELECT ic.*, u.full_name AS staff_name
      FROM inventory_checks ic
      INNER JOIN users u ON ic.user_id = u.id
      ORDER BY ic.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [parseInt(limit, 10), parseInt(offset, 10)]);
    return { rows, total };
  }

  async findById(id) {
    const query = `
      SELECT ic.*, u.full_name AS staff_name
      FROM inventory_checks ic
      INNER JOIN users u ON ic.user_id = u.id
      WHERE ic.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    if (!rows[0]) return null;

    const [items] = await pool.query(
      `SELECT icd.*, p.name AS product_name, p.code AS product_code, u.name AS base_unit_name
       FROM inventory_check_details icd
       INNER JOIN products p ON icd.product_id = p.id
       INNER JOIN units u ON icd.base_unit_id = u.id
       WHERE icd.inventory_check_id = ?`,
      [id]
    );

    return { ...rows[0], items };
  }

  async createCheck(userId, note, items) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = `KK-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await pool.query(
      `INSERT INTO inventory_checks (code, user_id, status, note) VALUES (?, ?, 'DRAFT', ?)`,
      [code, userId, note || null]
    );
    const checkId = result.insertId;

    for (const item of items) {
      const diffQty = parseFloat(item.actualQuantity) - parseFloat(item.systemQuantity);
      const diffVal = diffQty * parseFloat(item.unitCost || 0);

      await pool.query(
        `INSERT INTO inventory_check_details (inventory_check_id, product_id, base_unit_id, system_quantity, actual_quantity, difference_quantity, unit_cost, difference_value, reason)
         SELECT ?, ?, p.base_unit_id, ?, ?, ?, ?, ?, ?
         FROM products p WHERE p.id = ?`,
        [checkId, item.productId, item.systemQuantity, item.actualQuantity, diffQty, item.unitCost || 0, diffVal, item.reason || null, item.productId]
      );
    }

    return this.findById(checkId);
  }

  async balanceStockTransaction(connection, checkId, userId) {
    const [checkRows] = await connection.query('SELECT * FROM inventory_checks WHERE id = ? FOR UPDATE', [checkId]);
    const check = checkRows[0];
    if (!check) throw new Error('Phiếu kiểm kê không tồn tại');
    if (check.status === 'BALANCED') throw new Error('Phiếu kiểm kê này đã được cân bằng kho trước đó');

    const [items] = await connection.query(
      'SELECT * FROM inventory_check_details WHERE inventory_check_id = ?',
      [checkId]
    );

    let totalDiffValue = 0;

    for (const item of items) {
      const diffQty = parseFloat(item.difference_quantity);
      totalDiffValue += parseFloat(item.difference_value);

      if (diffQty !== 0) {
        // Cập nhật tồn kho theo số lượng thực tế
        await connection.query(
          'UPDATE inventory_stocks SET quantity_on_hand = ? WHERE product_id = ?',
          [item.actual_quantity, item.product_id]
        );

        // Ghi thẻ kho biến động cân bằng kho
        const movementType = diffQty > 0 ? 'STOCK_TAKE_ADJUST_IN' : 'STOCK_TAKE_ADJUST_OUT';
        await connection.query(
          `INSERT INTO inventory_movements (product_id, base_unit_id, movement_type, reference_type, reference_id, quantity_change, quantity_before, quantity_after, unit_cost, total_value, user_id, note)
           VALUES (?, ?, ?, 'inventory_checks', ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.product_id,
            item.base_unit_id,
            movementType,
            checkId,
            diffQty,
            item.system_quantity,
            item.actual_quantity,
            item.unit_cost,
            item.difference_value,
            userId,
            `Cân bằng kho theo phiếu kiểm kê ${check.code} [Lý do: ${item.reason || 'Lệch kiểm kê'}]`,
          ]
        );
      }
    }

    await connection.query(
      `UPDATE inventory_checks SET status = 'BALANCED', total_difference_value = ?, balanced_at = NOW() WHERE id = ?`,
      [totalDiffValue, checkId]
    );
  }
}

module.exports = new InventoryCheckRepository();
