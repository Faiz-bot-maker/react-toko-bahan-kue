import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlineDocumentReport, HiOutlineTrendingUp, HiOutlineCurrencyDollar } from 'react-icons/hi';
import { MdAnalytics } from 'react-icons/md';
import axios from 'axios';

const getHeaders = () => ({
  'Authorization': localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const LaporanPenjualan = () => {
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/sales-and-product-reports/sales`, { 
        headers: getHeaders() 
      });
      
      const data = response.data?.data || response.data || {};
      setSalesData(data);
    } catch (err) {
      console.error('Gagal mengambil data penjualan:', err);
    } finally {
      setLoading(false);
    }
  };

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Penjualan */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <HiOutlineTrendingUp className="text-2xl text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Total Penjualan</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {salesData.total_sales || 0}
                  </div>
                  <p className="text-xs text-gray-600">Transaksi</p>
                </div>

                {/* Total Pendapatan */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <HiOutlineCurrencyDollar className="text-2xl text-green-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Total Pendapatan</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {formatRupiah(salesData.total_revenue || 0)}
                  </div>
                  <p className="text-xs text-gray-600">Rupiah</p>
                </div>

                {/* Rata-rata Per Transaksi */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <HiOutlineCurrencyDollar className="text-2xl text-purple-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">Rata-rata/Transaksi</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {salesData.total_sales > 0 
                      ? formatRupiah(Math.round((salesData.total_revenue || 0) / salesData.total_sales))
                      : formatRupiah(0)
                    }
                  </div>
                  <p className="text-xs text-gray-600">Per transaksi</p>
                </div>
              </div>
            )}

            {/* Detail Data */}
            {!loading && salesData.sales_details && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Penjualan</h2>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produk
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Harga
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.sales_details.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(item.date).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.product_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatRupiah(item.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatRupiah(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanPenjualan; 