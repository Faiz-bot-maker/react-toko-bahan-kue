// src/pages/owner/OwnerLaporanPembelian.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdInventory } from "react-icons/md";

const API_URL = `${process.env.REACT_APP_API_URL}/purchases-reports/daily`;

const getHeaders = () => ({
  Authorization: localStorage.getItem("authToken"),
  "ngrok-skip-browser-warning": "true",
});

const OwnerLaporanPembelian = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if ((startDate && !endDate) || (!startDate && endDate)) return;
    fetchReports(currentPage);
  }, [startDate, endDate, branchFilter, currentPage]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/branches`, {
        headers: getHeaders(),
      });
      setBranches(res.data?.data || []);
    } catch (err) {
      console.error("Gagal memuat daftar cabang:", err);
    }
  };

  const fetchReports = async (page) => {
    try {
      setLoading(true);
      let params = { page };

      if (startDate && endDate) {
        const formatDate = (date) => {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        params.start_at = formatDate(startDate);
        params.end_at = formatDate(endDate);
      }

      if (branchFilter) {
        params.branch_id = branchFilter;
      }

      const res = await axios.get(API_URL, {
        headers: getHeaders(),
        params,
      });

      const data = res.data?.data || [];
      const paging = res.data?.paging || {};

      setReports(data);
      setCurrentPage(paging.page || 1);
      setTotalPages(paging.total_page || 1);
      setTotalItems(paging.total_item || 0);
    } catch (err) {
      console.error("Gagal memuat laporan pembelian:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setDateRange([null, null]);
    setBranchFilter("");
    setCurrentPage(1);
    fetchReports(1);
  };

  const formatDateDisplay = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const Pagination = ({ page, setPage, totalPages, total, perPage }) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, total);

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Menampilkan {total === 0 ? 0 : startIndex + 1}-{endIndex} dari total {total}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className={`px-2.5 py-1.5 rounded border ${
              page === 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded border ${
              page === 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1.5 rounded border ${
              page === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className={`px-2.5 py-1.5 rounded border ${
              page === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Judul dengan Icon */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdInventory className="text-3xl text-gray-700" />
            Laporan Pembelian Harian
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal</label>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              dateFormat="dd/MM/yyyy"
              className="border rounded px-3 py-2 text-sm w-60"
              placeholderText="Pilih rentang tanggal"
              maxDate={new Date()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="border rounded px-3 py-2 w-60"
            >
              <option value="">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cabang</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Total Transaksi</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Total Produk Beli</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Total Pembelian (Rp)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                          <MdInventory className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          Tidak ada data
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{formatDateDisplay(report.date)}</td>
                      <td className="px-6 py-4">{report.branch_name}</td>
                      <td className="px-6 py-4">{report.total_transactions}</td>
                      <td className="px-6 py-4">{report.total_products_buy}</td>
                      <td className="px-6 py-4">Rp{report.total_purchases.toLocaleString("id-ID")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={currentPage}
            setPage={setCurrentPage}
            totalPages={totalPages}
            total={totalItems}
            perPage={reports.length}
          />
        )}
      </div>
    </Layout>
  );
};

export default OwnerLaporanPembelian;
