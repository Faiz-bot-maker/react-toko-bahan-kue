import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Pelanggan from './pages/Pelanggan';
import LaporanPenjualan from './pages/LaporanPenjualan';
import Keuangan from './pages/Keuangan';
import Cabang from './pages/Cabang';
import Distributor from './pages/Distributor';
import Role from './pages/Role';
import LaporanTerlaris from './pages/LaporanTerlaris';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/pelanggan" element={<Pelanggan />} />
        <Route path="/laporan-penjualan" element={<LaporanPenjualan />} />
        <Route path="/keuangan" element={<Keuangan />} />
        <Route path="/cabang" element={<Cabang />} />
        <Route path="/distributor" element={<Distributor />} />
        <Route path="/role" element={<Role />} />
        <Route path="/laporan-terlaris" element={<LaporanTerlaris />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
