const { pool } = require('../config/database');

class DashboardRepository {
  async getSummary() {
    // 1. Tổng doanh thu và số đơn hôm nay
    const [todaySales] = await pool.query(`
      SELECT 
        COALESCE(SUM(grand_total), 0) AS today_revenue,
        COUNT(id) AS today_orders
      FROM orders
      WHERE DATE(created_at) = CURDATE() AND order_status = 'COMPLETED'
    `);

    // 2. Tổng khách hàng & tổng tồn kho
    const [counts] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM customers WHERE deleted_at IS NULL) AS total_customers,
        (SELECT COUNT(*) FROM products WHERE is_active = 1 AND deleted_at IS NULL) AS total_products,
        (SELECT COALESCE(SUM(quantity_on_hand), 0) FROM inventory_stocks) AS total_inventory_qty,
        (SELECT COALESCE(SUM(current_debt), 0) FROM customers) AS total_customer_debt,
        (SELECT COALESCE(SUM(current_debt), 0) FROM suppliers) AS total_supplier_debt
    `);

    // 3. Top 5 sản phẩm bán chạy nhất trong tháng
    const [topProducts] = await pool.query(`
      SELECT p.name AS product_name, SUM(od.base_quantity) AS total_sold
      FROM order_details od
      INNER JOIN products p ON od.product_id = p.id
      INNER JOIN orders o ON od.order_id = o.id
      WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND o.order_status = 'COMPLETED'
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    return {
      todayRevenue: todaySales[0].today_revenue,
      todayOrders: todaySales[0].today_orders,
      totalCustomers: counts[0].total_customers,
      totalProducts: counts[0].total_products,
      totalInventoryQty: counts[0].total_inventory_qty,
      totalCustomerDebt: counts[0].total_customer_debt,
      totalSupplierDebt: counts[0].total_supplier_debt,
      topProducts,
    };
  }
}

module.exports = new DashboardRepository();
