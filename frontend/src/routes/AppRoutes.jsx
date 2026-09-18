import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ProfilePage } from '../pages/auth/ProfilePage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { OverviewPage } from '../pages/dashboard/OverviewPage';
import { PosPage } from '../pages/pos/PosPage';
import { ProductListPage } from '../pages/products/ProductListPage';
import { BarcodePage } from '../pages/barcodes/BarcodePage';
import { CategoryBrandPage } from '../pages/categories/CategoryBrandPage';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { SupplierListPage } from '../pages/suppliers/SupplierListPage';
import { PurchaseOrderListPage } from '../pages/purchase-orders/PurchaseOrderListPage';
import { OrderListPage } from '../pages/orders/OrderListPage';
import { CustomerReturnPage } from '../pages/customer-returns/CustomerReturnPage';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { DebtListPage } from '../pages/debts/DebtListPage';
import { PromotionListPage } from '../pages/promotions/PromotionListPage';
import { EmployeeListPage } from '../pages/employees/EmployeeListPage';
import { ReportPage } from '../pages/reports/ReportPage';
import { DevicePage } from '../pages/devices/DevicePage';
import { SettingPage } from '../pages/settings/SettingPage';
import { CashbookPage } from '../pages/cashbook/CashbookPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Route Công Khai */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Toàn Bộ Route Nghiệp Vụ Trong Admin Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<OverviewPage />} />
        <Route path="statistics" element={<DashboardPage />} />
        <Route path="pos" element={<PosPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="barcodes" element={<BarcodePage />} />
        <Route path="categories" element={<CategoryBrandPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="suppliers" element={<SupplierListPage />} />
        <Route path="purchases" element={<PurchaseOrderListPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="returns" element={<CustomerReturnPage />} />
        <Route path="customers" element={<CustomerListPage />} />
        <Route path="debts" element={<DebtListPage />} />
        <Route path="promotions" element={<PromotionListPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="cashbook" element={<CashbookPage />} />
        <Route path="devices" element={<DevicePage />} />
        <Route path="settings" element={<SettingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
