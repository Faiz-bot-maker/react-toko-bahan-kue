import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
import { HiOutlineDocumentReport, HiOutlineTrendingUp, HiOutlineCurrencyDollar, HiOutlineShoppingBag } from 'react-icons/hi';
import { MdAnalytics } from 'react-icons/md';
import axios from 'axios';
import Layout from '../../components/Layout';

const getHeaders = () => ({
  'Authorization': localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const LaporanPenjualan = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/sales-and-product-reports/daily`, { 
        headers: getHeaders() 
      });
      
      const data = response.data?.data || [];
      setSalesData(data);
    } catch (err) {
      console.error('Gagal mengambil data penjualan:', err);
    } finally {
      setLoading(false);
    }
  };

  // kalkulasi untuk semua cabang
  const totalTransactions = salesData.reduce((sum, item) => sum + (item.total_transactions || 0), 0);
  const totalProductsSold = salesData.reduce((sum, item) => sum + (item.total_products_sold || 0), 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);

  return (
    <Layout>
          <div className="w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MdAnalytics className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h1>
                  <p className="text-sm text-gray-600">Analisis data penjualan perusahaan</p>
                </div>
              </div>
            </div>

            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Transaksi */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <HiOutlineTrendingUp className="text-2xl text-blue-600" />
                  </div>
                    <span className="text-xs text-gray-500 font-medium">Total Transaksi</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                    {totalTransactions}
                </div>
                <p className="text-xs text-gray-600">Transaksi</p>
              </div>

                {/* Total Produk Terjual */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                      <HiOutlineShoppingBag className="text-2xl text-green-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Total Produk Terjual</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {totalProductsSold}
                </div>
                  <p className="text-xs text-gray-600">Unit</p>
              </div>

                {/* Total Pendapatan */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <HiOutlineCurrencyDollar className="text-2xl text-purple-600" />
                  </div>
                    <span className="text-xs text-gray-500 font-medium">Total Pendapatan</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                      {formatRupiah(totalRevenue)}
                    </div>
                    <p className="text-xs text-gray-600">Rupiah</p>
                  </div>
                </div>

                {/* Detail Data Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Cabang</th>
                          <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Total Transaksi</th>
                          <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Produk Terjual</th>
                          <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Total Pendapatan</th>
                        </tr>
                      </thead>
                        <tbody className="divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-6">
                                <div className="animate-pulse space-y-3">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className="grid grid-cols-5 gap-4">
                                      <div className="h-4 bg-gray-200 rounded"></div>
                                      <div className="h-4 bg-gray-200 rounded"></div>
                                      <div className="h-4 bg-gray-200 rounded"></div>
                                      <div className="h-4 bg-gray-200 rounded"></div>
                                      <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ) : salesData.length === 0 ? (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <tr key={`placeholder-${i}`}>
                                  <td className="px-6 py-3"><div className="h-4 bg-gray-100 rounded"></div></td>
                                  <td className="px-6 py-3"><div className="h-4 bg-gray-100 rounded"></div></td>
                                  <td className="px-6 py-3"><div className="h-4 bg-gray-100 rounded"></div></td>
                                  <td className="px-6 py-3"><div className="h-4 bg-gray-100 rounded"></div></td>
                                  <td className="px-6 py-3"><div className="h-4 bg-gray-100 rounded"></div></td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada data penjualan</td>
                              </tr>
                            </>
                          ) : (
                            salesData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(item.date).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.branch_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.total_transactions}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.total_products_sold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatRupiah(item.total_revenue)}
                                </td>
                          </tr>
                            ))
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            </div>
    </Layout>
  );
};

export default LaporanPenjualan; 