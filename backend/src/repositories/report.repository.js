const { pool } = require('../config/database');

class ReportRepository {
  async getRevenueProfitReport({ startDate, endDate, groupBy = 'DAY' }) {
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'MONTH') dateFormat = '%Y-%m';
    if (groupBy === 'YEAR') dateFormat = '%Y';

    const params = [];
    let dateFilter = '';

    if (startDate) {
      dateFilter += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }

    const query = `
      SELECT 
        DATE_FORMAT(o.created_at, '${dateFormat}') AS period,
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(o.grand_total), 0) AS total_revenue,
        COALESCE(SUM(od.base_quantity * od.cost_price), 0) AS total_cogs,
        COALESCE(SUM(o.grand_total) - SUM(od.base_quantity * od.cost_price), 0) AS gross_profit
      FROM orders o
      INNER JOIN order_details od ON o.id = od.order_id
      WHERE o.order_status = 'COMPLETED' ${dateFilter}
      GROUP BY period
      ORDER BY period ASC
    `;
    const [rows] = await pool.query(query, params);
    return rows;
  }

  async getTopSellingProducts({ limit = 10, startDate, endDate }) {
    const params = [];
    let dateFilter = '';

    if (startDate) {
      dateFilter += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      dateFilter += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }

    const query = `
      SELECT 
        p.id, p.code, p.name, u.name AS base_unit_name,
        COALESCE(SUM(od.base_quantity), 0) AS total_sold_quantity,
        COALESCE(SUM(od.subtotal), 0) AS total_revenue,
        COALESCE(SUM(od.subtotal) - SUM(od.base_quantity * od.cost_price), 0) AS profit
      FROM order_details od
      INNER JOIN products p ON od.product_id = p.id
      INNER JOIN units u ON p.base_unit_id = u.id
      INNER JOIN orders o ON od.order_id = o.id
      WHERE o.order_status = 'COMPLETED' ${dateFilter}
      GROUP BY p.id
      ORDER BY total_sold_quantity DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [...params, parseInt(limit, 10)]);
    return rows;
  }

  async getSlowSellingProducts({ limit = 10, days = 30 }) {
    const query = `
      SELECT 
        p.id, p.code, p.name, u.name AS base_unit_name, inv.quantity_on_hand,
        COALESCE(SUM(od.base_quantity), 0) AS sold_in_period
      FROM products p
      INNER JOIN units u ON p.base_unit_id = u.id
      LEFT JOIN inventory_stocks inv ON p.id = inv.product_id
      LEFT JOIN order_details od ON p.id = od.product_id 
        AND od.order_id IN (SELECT id FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND order_status = 'COMPLETED')
      WHERE p.is_active = 1 AND p.deleted_at IS NULL
      GROUP BY p.id
      ORDER BY sold_in_period ASC, inv.quantity_on_hand DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [parseInt(days, 10), parseInt(limit, 10)]);
    return rows;
  }

  async getInventoryValuation() {
    const query = `
      SELECT 
        COUNT(p.id) AS total_active_products,
        COALESCE(SUM(inv.quantity_on_hand), 0) AS total_stock_quantity,
        COALESCE(SUM(inv.quantity_on_hand * inv.last_cost_price), 0) AS total_inventory_value,
        COUNT(CASE WHEN inv.quantity_on_hand <= p.min_stock_alert THEN 1 END) AS low_stock_count,
        COUNT(CASE WHEN inv.quantity_on_hand <= 0 THEN 1 END) AS out_of_stock_count
      FROM products p
      INNER JOIN inventory_stocks inv ON p.id = inv.product_id
      WHERE p.is_active = 1 AND p.deleted_at IS NULL
    `;
    const [rows] = await pool.query(query);
    return rows[0];
  }
}

module.exports = new ReportRepository();
