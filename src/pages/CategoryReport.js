import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
import Layout from '../components/Layout';
import { HiOutlineTrendingUp, HiOutlineCube } from 'react-icons/hi';
import { MdCategory } from 'react-icons/md';
import axios from 'axios';

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const CategoryReport = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryReport();
  }, []);

  const fetchCategoryReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/sales-and-product-reports/categories`, { 
        headers: getHeaders() 
      });
      const data = response.data?.data || [];
      setCategoryData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Gagal mengambil data laporan kategori:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
          <div className="w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MdCategory className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Kategori Terlaris</h1>
                  <p className="text-sm text-gray-600">Analisis penjualan berdasarkan kategori produk</p>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                        Ranking
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                        Total Terjual
                      </th>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                        Omset
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <span className="ml-3 text-gray-600">Memuat data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : categoryData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <MdCategory className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data laporan kategori</h3>
                            <p className="text-gray-500">Data akan muncul setelah ada transaksi penjualan</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categoryData.map((category, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
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
                                  {category.category_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {category.category_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{category.total_qty}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{formatRupiah(category.total_omzet)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
    </Layout>
  );
};

export default CategoryReport;
