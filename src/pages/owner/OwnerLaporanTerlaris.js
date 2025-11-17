import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { HiOutlineStar, HiOutlineTrendingUp, HiOutlineCube } from 'react-icons/hi';
import { MdTrendingUp, MdCategory } from 'react-icons/md';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const OwnerLaporanTerlaris = () => {

  const [bestSellers, setBestSellers] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Pagination
  const [productPage, setProductPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const pageSize = 5;

  // Tabs
  const [activeTab, setActiveTab] = useState("category");

  // FILTER TANGGAL
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([fetchBestSellers(), fetchCategoryReport()]);
  };

  const buildParams = () => {
    const params = {};
    if (startDate) params.start_date = startDate.toISOString().split("T")[0];
    if (endDate) params.end_date = endDate.toISOString().split("T")[0];
    return params;
  };

  const fetchBestSellers = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales-reports/top-seller-products`,
        { headers: getHeaders(), params: buildParams() }
      );
      const data = response.data?.data || [];
      setBestSellers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data produk terlaris:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategoryReport = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales-reports/top-seller-categories`,
        { headers: getHeaders(), params: buildParams() }
      );
      const data = response.data?.data || [];
      setCategoryData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data laporan kategori:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Pagination (Product)
  const productTotalPages = Math.max(1, Math.ceil(bestSellers.length / pageSize));
  const productStartIndex = (productPage - 1) * pageSize;
  const productEndIndex = Math.min(productStartIndex + pageSize, bestSellers.length);
  const bestSellersPage = bestSellers.slice(productStartIndex, productStartIndex + pageSize);

  // Pagination (Category)
  const categoryTotalPages = Math.max(1, Math.ceil(categoryData.length / pageSize));
  const categoryStartIndex = (categoryPage - 1) * pageSize;
  const categoryEndIndex = Math.min(categoryStartIndex + pageSize, categoryData.length);
  const categoryPageData = categoryData.slice(categoryStartIndex, categoryStartIndex + pageSize);

  const Pagination = ({ total, page, setPage, startIndex, endIndex, totalPages }) => (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
      <div className="text-xs text-gray-500">
        Menampilkan {total === 0 ? 0 : startIndex + 1}-{endIndex} dari total {total} data
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className={`px-2.5 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          «
        </button>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-3 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">Halaman {page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`px-3 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          Next
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className={`px-2.5 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          »
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
              <HiOutlineTrendingUp className="text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Laporan Terlaris</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-gray-50 p-2 rounded-2xl mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('category')}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition ${activeTab === 'category'
                ? 'bg-white text-purple-700 shadow-md border border-purple-100'
                : 'text-gray-600 hover:bg-white/50'
              }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'category' ? "bg-purple-100" : "bg-gray-100"}`}>
              <MdCategory className={`text-lg ${activeTab === 'category' ? "text-purple-600" : "text-gray-500"}`} />
            </div>
            <span className="font-semibold">Kategori Terlaris</span>
          </button>

          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition ${activeTab === 'product'
                ? 'bg-white text-yellow-700 shadow-md border border-yellow-100'
                : 'text-gray-600 hover:bg-white/50'
              }`}
          >
            <div className={`p-2 rounded-lg ${activeTab === 'product' ? "bg-yellow-100" : "bg-gray-100"}`}>
              <MdTrendingUp className={`text-lg ${activeTab === 'product' ? "text-yellow-600" : "text-gray-500"}`} />
            </div>
            <span className="font-semibold">Produk Terlaris</span>
          </button>
        </div>

        {/* FILTER TANGGAL */}
        <div className="flex items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Tanggal Awal</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih tanggal"
              className="px-3 py-2 border rounded-lg w-44 shadow-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih tanggal"
              className="px-3 py-2 border rounded-lg w-44 shadow-sm"
            />
          </div>

          <button
            onClick={fetchAll}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
          >
            Terapkan
          </button>
        </div>

        {/* ====================== KATEGORI TERLARIS ====================== */}
        {activeTab === "category" && (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">

            <div className="px-8 py-6 border-b bg-purple-50">
              <h2 className="text-xl font-bold text-gray-900">Kategori Terlaris</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Ranking
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                      Total Terjual
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                      Omset
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loadingCategories ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-8">
                        <div className="animate-pulse space-y-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="grid grid-cols-4 gap-6">
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ) : categoryData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-gray-600">
                        Tidak ada data kategori
                      </td>
                    </tr>
                  ) : (
                    categoryPageData.map((category, index) => {
                      const rank = categoryStartIndex + index + 1;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-8 py-4">
                            <span className="font-bold">{rank}</span>
                          </td>
                          <td className="px-8 py-4">{category.category_name}</td>
                          <td className="px-8 py-4 text-right">{category.total_qty.toLocaleString()}</td>
                          <td className="px-8 py-4 text-right">{formatRupiah(category.total_omzet)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {categoryData.length > pageSize && (
              <Pagination
                total={categoryData.length}
                page={categoryPage}
                setPage={setCategoryPage}
                startIndex={categoryStartIndex}
                endIndex={categoryEndIndex}
                totalPages={categoryTotalPages}
              />
            )}

          </div>
        )}

        {/* ====================== PRODUK TERLARIS ====================== */}
        {activeTab === "product" && (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">

            <div className="px-8 py-6 border-b bg-yellow-50">
              <h2 className="text-xl font-bold text-gray-900">Produk Terlaris</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase">Ranking</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold uppercase">Produk</th>
                    <th className="px-8 py-4 text-right text-xs font-semibold uppercase">Total Terjual</th>
                    <th className="px-8 py-4 text-right text-xs font-semibold uppercase">Omset</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center">
                        <div className="animate-spin h-10 w-10 border-b-2 border-yellow-500 rounded-full mx-auto"></div>
                        <p className="mt-4 text-gray-600">Memuat data produk...</p>
                      </td>
                    </tr>
                  ) : bestSellers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-gray-600">
                        Belum ada data produk terlaris
                      </td>
                    </tr>
                  ) : (
                    bestSellersPage.map((product, index) => {
                      const rank = productStartIndex + index + 1;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-8 py-4 font-bold">{rank}</td>
                          <td className="px-8 py-4">
                            <div className="font-semibold text-gray-900">{product.product_name}</div>
                            <div className="text-xs text-gray-500">SKU: {product.product_sku}</div>
                          </td>
                          <td className="px-8 py-4 text-right">{product.total_qty.toLocaleString()}</td>
                          <td className="px-8 py-4 text-right">{formatRupiah(product.total_omzet)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>

            {bestSellers.length > pageSize && (
              <Pagination
                total={bestSellers.length}
                page={productPage}
                setPage={setProductPage}
                startIndex={productStartIndex}
                endIndex={productEndIndex}
                totalPages={productTotalPages}
              />
            )}

          </div>
        )}

      </div>
    </Layout>
  );
};

export default OwnerLaporanTerlaris;
