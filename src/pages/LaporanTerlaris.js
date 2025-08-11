import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlineStar, HiOutlineTrendingUp, HiOutlineCube } from 'react-icons/hi';
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
    { label: 'All', value: '' },
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
          <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
              {/* <HiOutlineStar className="text-2xl text-yellow-600" /> */}
              <h1 className="text-2xl font-bold text-gray-800">Produk Terlaris</h1>
            </div>

            {/* Filter branch dengan button */}
            <div className="mb-6 flex gap-3">
              {branches.map((branch) => (
                <button
                  key={branch.value}
                  onClick={() => setSelectedBranch(branch.value)}
                  className={`px-4 py-2 rounded font-semibold text-sm
                    ${selectedBranch === branch.name
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  `}
                >
                  {branch.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Memuat data...</div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ranking
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        {!selectedBranch && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cabang
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Terjual
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Omset
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bestSellers.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                                <div className="text-sm text-gray-500">
                                  SKU: {product.sku || '-'}
                                </div>
                              </div>
                            </div>
                          </td>
                          {!selectedBranch && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.branch || product.branch_name || '-'}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <HiOutlineTrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              {product.total || product.total_qty || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatRupiah(product.total_sales || product.total_revenue || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && bestSellers.length === 0 && (
              <div className="text-center py-12">
                <HiOutlineCube className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Belum ada produk yang terjual.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LaporanTerlaris;
