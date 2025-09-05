import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginCheck from './components/LoginCheck';
// import AdminGuard from './components/AdminGuard';
import Login from './pages/Login';

// Owner Page
import Dashboard from './pages/owner/Dashboard';
import Products from './pages/owner/Products';
// import Orders from './pages/owner/Orders';
import Users from './pages/owner/Users';
import LaporanPenjualan from './pages/owner/LaporanPenjualan';
import Keuangan from './pages/owner/Keuangan';
import Cabang from './pages/owner/Cabang';
import Distributor from './pages/owner/Distributor';
import Role from './pages/owner/Role';
import LaporanTerlaris from './pages/owner/LaporanTerlaris';
import LaporanPiutang from './pages/owner/LaporanPiutang';
import Categories from './pages/owner/Kategori';
import SizeProduct from './pages/owner/SizeProduct';
import LaporanPengeluaran from './pages/owner/LaporanPengeluaran';
import Pengeluaran from './pages/owner/Pengeluaran';
import Modal from './pages/owner/Modal';
import BarangKeluar from './pages/owner/BarangKeluar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRoles from './pages/admin/AdminRoles';
import AdminCabang from './pages/admin/AdminCabang';
import AdminKeuangan from './pages/admin/AdminKeuangan';
import AdminDistributor from './pages/admin/AdminDistributor';
import AdminLaporanPenjualan from './pages/admin/AdminLaporanPenjualan';
import AdminModal from './pages/admin/AdminModal';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <LoginCheck>
              <Dashboard />
            </LoginCheck>
          } />
          <Route path="/products" element={
            <LoginCheck>
              <Products />
            </LoginCheck>
          } />
          {/* <Route path="/orders" element={
            <LoginCheck>
              <Orders />
            </LoginCheck>
          } /> */}
          <Route path="/users" element={
            <LoginCheck>
              <Users />
            </LoginCheck>
          } />
          <Route path="/categories" element={
            <LoginCheck>
              <Categories />
            </LoginCheck>
          } />
          <Route path="/laporan-penjualan" element={
            <LoginCheck>
              <LaporanPenjualan />
            </LoginCheck>
          } />
          <Route path="/laporan-pengeluaran" element={
            <LoginCheck>
              <LaporanPengeluaran />
            </LoginCheck>
          } />
          <Route path="/pengeluaran" element={
            <LoginCheck>
              <Pengeluaran />
            </LoginCheck>
          } />
          <Route path="/keuangan" element={
            <LoginCheck>
              <Keuangan />
            </LoginCheck>
          } />
          <Route path="/cabang" element={
            <LoginCheck>
              <Cabang />
            </LoginCheck>
          } />
          <Route path="/distributor" element={
            <LoginCheck>
              <Distributor />
            </LoginCheck>
          } />
          <Route path="/role" element={
            <LoginCheck>
              <Role />
            </LoginCheck>
          } />
          <Route path="/laporan-produk-terlaris" element={
            <LoginCheck>
              <LaporanTerlaris />
            </LoginCheck>
          } />
          <Route path="/laporan-piutang" element={
            <LoginCheck>
              <LaporanPiutang />
            </LoginCheck>
          } />
          <Route path="/pages/sizeproduct" element={
            <LoginCheck>
              <SizeProduct />
            </LoginCheck>
          } />
          <Route path="/modal" element={
            <LoginCheck>
              <Modal />
            </LoginCheck>
          } />
          <Route path="/barang-keluar" element={
            <LoginCheck>
              <BarangKeluar />
            </LoginCheck>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <LoginCheck>

              <AdminDashboard />

            </LoginCheck>
          } />
          <Route path="/admin/products" element={
            <LoginCheck>

              <AdminProducts />

            </LoginCheck>
          } />
          <Route path="/admin/categories" element={
            <LoginCheck>

              <AdminCategories />

            </LoginCheck>
          } />
          <Route path="/admin/users" element={
            <LoginCheck>

              <AdminUsers />

            </LoginCheck>
          } />
          <Route path="/admin/roles" element={
            <LoginCheck>

              <AdminRoles />

            </LoginCheck>
          } />
          <Route path="/admin/cabang" element={
            <LoginCheck>

              <AdminCabang />

            </LoginCheck>
          } />
          <Route path="/admin/keuangan" element={
            <LoginCheck>

              <AdminKeuangan />

            </LoginCheck>
          } />
          <Route path="/admin/distributor" element={
            <LoginCheck>

              <AdminDistributor />

            </LoginCheck>
          } />
          <Route path="/admin/laporan-penjualan" element={
            <LoginCheck>

              <AdminLaporanPenjualan />

            </LoginCheck>
          } />
          <Route path="/admin/modal" element={
            <LoginCheck>

              <AdminModal />

            </LoginCheck>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
