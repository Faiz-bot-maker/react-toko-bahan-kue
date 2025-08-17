import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlineDocumentReport, HiOutlineTrendingUp, HiOutlineCurrencyDollar, HiOutlineShoppingBag } from 'react-icons/hi';
import { MdAnalytics } from 'react-icons/md';
import axios from 'axios';

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
    <div className="flex h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-8 min-w-0">
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

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Memuat data...</span>
                </div>
              </div>
            ) : (
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
                {salesData.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                            Tanggal
                          </th>
                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                              Cabang
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                              Total Transaksi
                          </th>
                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                              Produk Terjual
                          </th>
                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                              Total Pendapatan
                          </th>
                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                              Metode Pembayaran
                          </th>
                        </tr>
                      </thead>
                        <tbody className="divide-y divide-gray-200">
                          {loading ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center">
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                  <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                </div>
                              </td>
                            </tr>
                          ) : salesData.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                Tidak ada data penjualan
                              </td>
                            </tr>
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
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  <div className="space-y-1">
                                    {item.payment_methods && Object.entries(item.payment_methods).map(([method, amount]) => (
                                      <div key={method} className="flex justify-between text-xs">
                                        <span className="font-medium">{method}:</span>
                                        <span>{formatRupiah(amount)}</span>
                                      </div>
                                    ))}
                                  </div>
                            </td>
                          </tr>
                            ))
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanPenjualan; 