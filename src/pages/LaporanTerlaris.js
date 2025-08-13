import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlineStar, HiOutlineTrendingUp, HiOutlineCube } from 'react-icons/hi';
import { MdTrendingUp } from 'react-icons/md';
import axios from 'axios';

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const LaporanTerlaris = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(''); // '' = all

  useEffect(() => {
    fetchBestSellers();
  }, [selectedBranch]);

  const fetchBestSellers = async () => {
    try {
      setLoading(true);
      const url = selectedBranch 
        ? `${process.env.REACT_APP_API_URL}/sales-and-product-reports/best-selling-product?branch_id=${selectedBranch}`
        : `${process.env.REACT_APP_API_URL}/sales-and-product-reports/best-selling-product`;
      
      const response = await axios.get(url, { headers: getHeaders() });
      const data = response.data?.data || response.data || [];
      setBestSellers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil data produk terlaris:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tombol filter branch
  const branches = [
    { label: 'Semua Cabang', value: '' },
    { label: 'Cabang 1', value: '1' },
    { label: 'Cabang 2', value: '2' },
    // Tambah cabang lain kalau perlu
  ];

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
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <MdTrendingUp className="text-2xl text-yellow-600" />
                </div>
                <div>
              <h1 className="text-2xl font-bold text-gray-800">Produk Terlaris</h1>
                  <p className="text-sm text-gray-600">Analisis produk dengan penjualan tertinggi</p>
                </div>
              </div>
            </div>

            {/* Filter branch dengan button */}
            <div className="mb-6 flex gap-2">
              {branches.map((branch) => (
                <button
                  key={branch.value}
                  onClick={() => setSelectedBranch(branch.value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors
                    ${selectedBranch === branch.value
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  `}
                >
                  {branch.label}
                </button>
              ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                      <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Ranking
                        </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Produk
                        </th>
                        {!selectedBranch && (
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                            Cabang
                          </th>
                        )}
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Total Terjual
                        </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                          Omset
                        </th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={!selectedBranch ? 5 : 4} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                            <span className="ml-3 text-gray-600">Memuat data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : bestSellers.length === 0 ? (
                      <tr>
                        <td colSpan={!selectedBranch ? 5 : 4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <MdTrendingUp className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data produk terlaris</h3>
                            <p className="text-gray-500">Data akan muncul setelah ada transaksi penjualan</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bestSellers.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <HiOutlineCube className="h-6 w-6 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.product_name || product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  SKU: {product.sku || '-'}
                                </div>
                              </div>
                            </div>
                          </td>
                          {!selectedBranch && (
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                              {product.branch || product.branch_name || '-'}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <HiOutlineTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm text-gray-900">{product.total || product.total_qty || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                            {formatRupiah(product.total_sales || product.total_revenue || 0)}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanTerlaris;
