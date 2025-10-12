import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginCheck from './components/LoginCheck';
import RoleGuard from './components/RoleGuard';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Login from './pages/Login';

// Owner Page
import Dashboard from './pages/owner/OwnerDashboard';
import Products from './pages/owner/OwnerProducts';
// import Orders from './pages/owner/OwnerOrders';
import Users from './pages/owner/OwnerUsers';
import LaporanPenjualan from './pages/owner/OwnerLaporanPenjualan';
import Keuangan from './pages/owner/OwnerKeuangan';
import Cabang from './pages/owner/OwnerCabang';
import Distributor from './pages/owner/OwnerDistributor';
import Role from './pages/owner/OwnerRole';
import LaporanTerlaris from './pages/owner/OwnerLaporanTerlaris';
import LaporanPiutang from './pages/owner/OwnerLaporanPiutang';
import Categories from './pages/owner/OwnerKategori';
import SizeProduct from './pages/owner/OwnerSizeProduct';
import LaporanPengeluaran from './pages/owner/OwnerLaporanPengeluaran';
import Pengeluaran from './pages/owner/OwnerPengeluaran';
import Modal from './pages/owner/OwnerModal';
// import BarangKeluar from './pages/owner/OwnerBarangKeluar';
import OwnerAlurKas from './pages/owner/OwnerAlurKas';
import OwnerPergerakanStok from './pages/owner/OwnerPergerakanStok';
import OwnerTransaksiKeluar from './pages/owner/OwnerTransaksiKeluar';
import OwnerInventory from './pages/owner/OwnerInventory';
import OwnerPembelian from './pages/owner/OwnerLaporanPembelian';

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
import AdminInventory from './pages/admin/AdminInventory';
import SizeInventory from './pages/admin/InventorySize';
import AdminPengeluaran from './pages/admin/AdminLaporanPengeluaran';
import AdminTransaksiKeluar from './pages/admin/AdminTransaksiKeluar';
import AdminLaporanPiutang from './pages/admin/AdminLaporanPiutang';
import AdminAlurKas from './pages/admin/AdminAlurKas';
import AdminPergerakanStok from './pages/admin/AdminPergerakanStok';
import AdminLaporanPembelian from './pages/admin/AdminLaporanPembelian';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */ }
          <Route path="/login" element={ <Login /> } />

          {/* Protected Routes */ }
          <Route path="/dashboard" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Dashboard />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/products" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Products />
              </RoleGuard>
            </LoginCheck>
          } />
          {/* <Route path="/orders" element={
            <LoginCheck>
              <RoleGuard allowedRoles={['owner', 'user', 'manager']}>
                <Orders />
              </RoleGuard>
            </LoginCheck>
          } /> */}
          <Route path="/users" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Users />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/categories" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Categories />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/laporan-penjualan" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <LaporanPenjualan />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/laporan-pengeluaran" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <LaporanPengeluaran />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/pengeluaran" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Pengeluaran />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/keuangan" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Keuangan />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/cabang" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Cabang />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/distributor" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Distributor />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/role" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Role />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/laporan-produk-terlaris" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <LaporanTerlaris />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/laporan-piutang" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <LaporanPiutang />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/pages/sizeproduct" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <SizeProduct />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/modal" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <Modal />
              </RoleGuard>
            </LoginCheck>
          } />
          {/* <Route path="/barang-keluar" element={
            <LoginCheck>
              <RoleGuard allowedRoles={['owner', 'user', 'manager']}>
                <BarangKeluar />
              </RoleGuard>
            </LoginCheck>
          } /> */}
          <Route path="/own-alur-kas" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <OwnerAlurKas />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/own-pergerakan-stok" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <OwnerPergerakanStok />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/own-transaksi-keluar" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <OwnerTransaksiKeluar />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/own-inventory" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <OwnerInventory />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/own-laporan-pembelian" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'owner', 'user', 'manager' ] }>
                <OwnerPembelian />
              </RoleGuard>
            </LoginCheck>
          } />

          {/* Admin Routes */ }
          <Route path="/admin/dashboard" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminDashboard />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/products" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminProducts />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/categories" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminCategories />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/users" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminUsers />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/roles" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminRoles />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/cabang" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminCabang />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/keuangan" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminKeuangan />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/distributor" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminDistributor />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/laporan-penjualan" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminLaporanPenjualan />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/modal" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminModal />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/inventory" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminInventory />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/size-inventory" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <SizeInventory />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/out-report" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminPengeluaran />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/adm-transaksi-keluar" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminTransaksiKeluar />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/adm-piutang" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminLaporanPiutang />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/adm-alur-kas" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminAlurKas />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/adm-pergerakan-stok" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminPergerakanStok />
              </RoleGuard>
            </LoginCheck>
          } />
          <Route path="/admin/adm-laporan-pembelian" element={
            <LoginCheck>
              <RoleGuard allowedRoles={ [ 'admin', 'super_admin' ] }>
                <AdminLaporanPembelian />
              </RoleGuard>
            </LoginCheck>
          } />


          {/* Default redirect */ }
          <Route path="/" element={ <RoleBasedRedirect /> } />
          <Route path="*" element={ <RoleBasedRedirect /> } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
