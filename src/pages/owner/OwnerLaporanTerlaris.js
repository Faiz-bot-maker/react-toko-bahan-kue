import React, { useState, useEffect } from "react";
import Layout from '../../components/Layout';
import { HiOutlineTrendingUp } from "react-icons/hi";
import { MdTrendingUp, MdCategory } from 'react-icons/md';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

// ======================= FORMAT TANGGAL TANPA UTC =======================
const formatLocalDate = (date) => {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const OwnerLaporanTerlaris = () => {

  const [bestSellers, setBestSellers] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Pagination
  const [productPage, setProductPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const pageSize = 5;

  // Tabs
  const [activeTab, setActiveTab] = useState("category");

  // Date Range Filter
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    fetchAll();
  }, []);

  const buildParams = () => {
    const params = {};
    if (startDate) params.start_at = formatLocalDate(startDate);
    if (endDate) params.end_at = formatLocalDate(endDate);
    return params;
  };

  // ======================= FETCH PRODUK =======================
  const fetchBestSellers = async (overrideParams = null) => {
    try {
      setLoadingProducts(true);

      const params = overrideParams !== null ? overrideParams : buildParams();

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales-reports/top-seller-products`,
        { headers: getHeaders(), params }
      );

      const data = res.data?.data || [];
      setBestSellers(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Gagal mengambil produk terlaris:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // ======================= FETCH KATEGORI =======================
  const fetchCategoryReport = async (overrideParams = null) => {
    try {
      setLoadingCategories(true);

      const params = overrideParams !== null ? overrideParams : buildParams();

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales-reports/top-seller-categories`,
        { headers: getHeaders(), params }
      );

      const data = res.data?.data || [];
      setCategoryData(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Gagal mengambil laporan kategori:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchBestSellers(), fetchCategoryReport()]);
  };

  // ======================= RESET =======================
  const handleReset = () => {
    setDateRange([null, null]);
    setCategoryPage(1);
    setProductPage(1);

    // fetch Ulang tanpa filter tanggal
    fetchBestSellers({});
    fetchCategoryReport({});
  };

  // ======================= PAGINATION =======================
  const productTotalPages = Math.max(1, Math.ceil(bestSellers.length / pageSize));
  const productStartIndex = (productPage - 1) * pageSize;
  const productEndIndex = Math.min(productStartIndex + pageSize, bestSellers.length);
  const bestSellersPage = bestSellers.slice(productStartIndex, productStartIndex + pageSize);

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
        <button onClick={() => setPage(1)} disabled={page === 1} className="px-2.5 py-1.5 border rounded">«</button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded">Prev</button>
        <span className="text-sm">{page} / {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded">Next</button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2.5 py-1.5 border rounded">»</button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-xl shadow-sm">
              <HiOutlineTrendingUp className="text-3xl text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Terlaris</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-gray-50 p-2 rounded-2xl mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab("category")}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-xl ${activeTab === "category"
                ? "bg-white text-purple-700 shadow-md"
                : "text-gray-600"
              }`}
          >
            <MdCategory /> Kategori Terlaris
          </button>

          <button
            onClick={() => setActiveTab("product")}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-xl ${activeTab === "product"
                ? "bg-white text-yellow-700 shadow-md"
                : "text-gray-600"
              }`}
          >
            <MdTrendingUp /> Produk Terlaris
          </button>
        </div>

        {/* FILTER DATE RANGE */}
        <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-xl border shadow-sm mb-6">

          {/* Date Range Picker */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Range Tanggal</label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              className="px-3 py-2 border rounded-lg w-60 shadow-sm"
              dateFormat="dd/MM/yyyy"
              isClearable
              placeholderText="Pilih rentang tanggal"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-6">

            {/* Terapkan */}
            <button
              onClick={fetchAll}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
            >
              Terapkan
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg shadow text-gray-700"
            >
              Reset
            </button>

          </div>
        </div>

        {/* ====================== KATEGORI TERLARIS ====================== */}
        {activeTab === "category" && (
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="px-8 py-6 bg-purple-50 border-b">
              <h2 className="text-xl font-bold">Kategori Terlaris</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left">Ranking</th>
                    <th className="px-8 py-4 text-left">Kategori</th>
                    <th className="px-8 py-4 text-right">Total Terjual</th>
                    <th className="px-8 py-4 text-right">Omset</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingCategories ? (
                    <tr><td colSpan={4} className="px-8 py-12 text-center">Memuat...</td></tr>
                  ) : categoryData.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-600">Tidak ada data</td></tr>
                  ) : (
                    categoryPageData.map((c, index) => {
                      const rank = categoryStartIndex + index + 1;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-8 py-4 font-bold">{rank}</td>
                          <td className="px-8 py-4">{c.category_name}</td>
                          <td className="px-8 py-4 text-right">{c.total_qty.toLocaleString()}</td>
                          <td className="px-8 py-4 text-right">{formatRupiah(c.total_omzet)}</td>
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
            <div className="px-8 py-6 bg-yellow-50 border-b">
              <h2 className="text-xl font-bold">Produk Terlaris</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left">Ranking</th>
                    <th className="px-8 py-4 text-left">Produk</th>
                    <th className="px-8 py-4 text-right">Total Terjual</th>
                    <th className="px-8 py-4 text-right">Omset</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingProducts ? (
                    <tr><td colSpan={4} className="px-8 py-12 text-center">Memuat...</td></tr>
                  ) : bestSellers.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-16 text-center text-gray-600">Tidak ada data</td></tr>
                  ) : (
                    bestSellersPage.map((p, index) => {
                      const rank = productStartIndex + index + 1;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-8 py-4 font-bold">{rank}</td>
                          <td className="px-8 py-4">
                            <div className="font-semibold">{p.product_name}</div>
                            <div className="text-xs text-gray-500">SKU: {p.product_sku}</div>
                          </td>
                          <td className="px-8 py-4 text-right">{p.total_qty.toLocaleString()}</td>
                          <td className="px-8 py-4 text-right">{formatRupiah(p.total_omzet)}</td>
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
