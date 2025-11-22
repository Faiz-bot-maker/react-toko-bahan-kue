import React, { useState, useEffect } from 'react';
import { HiOutlineTrendingUp, HiOutlineCurrencyDollar, HiOutlineShoppingBag } from 'react-icons/hi';
import { MdAnalytics } from 'react-icons/md';
import axios from 'axios';
import Layout from '../../components/Layout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const OwnerLaporanPenjualan = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [branchFilter, setBranchFilter] = useState(null);
  const [branches, setBranchOptions] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, endDate] = dateRange;

  // get branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/branches`,
          { headers: getHeaders() }
        );
        if (res.data?.data) setBranchOptions(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil daftar cabang:", err);
      }
    };
    fetchBranches();
  }, []);

  // fetch sales data
  const fetchSalesData = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      params.append('page', page);
      params.append('size', 10);

      if (branchFilter) params.append('branch_id', branchFilter);
      if (searchTerm) params.append('search', searchTerm);

      if (startDate && endDate) {
        const formatLocal = (d) => {
          const dt = new Date(d);
          return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
        };

        params.append('start_at', formatLocal(startDate));
        params.append('end_at', formatLocal(endDate));
      }

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales-reports/daily?${params.toString()}`,
        { headers: getHeaders() }
      );

      const data = res.data?.data || [];
      const paging = res.data?.paging || {};

      setSalesData(data);
      setCurrentPage(paging.page || 1);
      setTotalPages(paging.total_page || 1);
      setTotalItems(paging.total_item || 0);

    } catch (err) {
      console.error("Gagal mengambil data penjualan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(currentPage);
  }, [currentPage, branchFilter, startDate, endDate, searchTerm]);

  // summary
  const totalTransactions = salesData.reduce((s, a) => s + (a.total_transactions || 0), 0);
  const totalProductsSold = salesData.reduce((s, a) => s + (a.total_products_sold || 0), 0);
  const totalRevenue = salesData.reduce((s, a) => s + (a.total_revenue || 0), 0);

  // Pagination baru
  const Pagination = ({ page, setPage, totalPages, total, perPage }) => {
    const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Menampilkan {startIndex}-{endIndex} dari total {total} data
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1}
            className={`px-2.5 py-1.5 rounded border ${
              page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}>
            «
          </button>

          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className={`px-3 py-1.5 rounded border ${
              page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}>
            Prev
          </button>

          <span className="text-sm text-gray-700">
            {page} / {totalPages}
          </span>

          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className={`px-3 py-1.5 rounded border ${
              page === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}>
            Next
          </button>

          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
            className={`px-2.5 py-1.5 rounded border ${
              page === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}>
            »
          </button>
        </div>
      </div>
    );
  };

  const resetFilters = () => {
    setBranchFilter(null);
    setDateRange([null, null]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MdAnalytics className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Laporan Penjualan
              </h1>
              <p className="text-sm text-gray-600">
                Analisis data penjualan perusahaan
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY BOX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <HiOutlineTrendingUp className="text-2xl text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Total Transaksi
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {totalTransactions}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <HiOutlineShoppingBag className="text-2xl text-green-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Total Produk Terjual
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {totalProductsSold}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <HiOutlineCurrencyDollar className="text-2xl text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Total Pendapatan
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {formatRupiah(totalRevenue)}
            </div>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-end gap-6">

            {/* Cabang */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Cabang
              </label>
              <select
                value={branchFilter || ''}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-lg px-4 py-2 w-56 text-sm"
              >
                <option value="">Semua Cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Rentang Tanggal
              </label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(range) => {
                  setDateRange(range);
                  setCurrentPage(1);
                }}
                isClearable
                maxDate={new Date()}
                dateFormat="dd/MM/yyyy"
                placeholderText="Pilih rentang tanggal"
                className="border rounded-lg px-4 py-2 w-56 text-sm"
              />
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-5 py-2 bg-gray-200 text-sm rounded-lg hover:bg-gray-300 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs uppercase font-semibold tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase font-semibold tracking-wider">
                    Cabang
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase font-semibold tracking-wider">
                    Total Transaksi
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase font-semibold tracking-wider">
                    Produk Terjual
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase font-semibold tracking-wider">
                    Total Pendapatan
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : salesData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <MdAnalytics className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">Tidak ada data penjualan</p>
                    </td>
                  </tr>
                ) : (
                  salesData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {new Date(item.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4">{item.branch_name}</td>
                      <td className="px-6 py-4">{item.total_transactions}</td>
                      <td className="px-6 py-4">{item.total_products_sold}</td>
                      <td className="px-6 py-4">
                        {formatRupiah(item.total_revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              setPage={setCurrentPage}
              totalPages={totalPages}
              total={totalItems}
              perPage={10}
            />
          )}

        </div>
      </div>
    </Layout>
  );
};

export default OwnerLaporanPenjualan;
