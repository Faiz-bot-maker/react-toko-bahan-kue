import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginCheck from './components/LoginCheck';
import Login from './pages/Login';
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
import Categories from './pages/Kategori';

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
          <Route path="/orders" element={
            <LoginCheck>
              <Orders />
            </LoginCheck>
          } />
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
          <Route path="/pelanggan" element={
            <LoginCheck>
              <Pelanggan />
            </LoginCheck>
          } />
          <Route path="/laporan-penjualan" element={
            <LoginCheck>
              <LaporanPenjualan />
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
          <Route path="/laporan-terlaris" element={
            <LoginCheck>
              <LaporanTerlaris />
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
