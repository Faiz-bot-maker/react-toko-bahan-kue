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

  const [resetTrigger, setResetTrigger] = useState(false); // FIX reset 1 kali klik

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchReports(currentPage);
  }, [branchFilter, currentPage]);

  useEffect(() => {
    if (resetTrigger) {
      fetchReports(1);
      setResetTrigger(false);
    }
  }, [resetTrigger]);

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

  const formatDate = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);

      let params = { page };

      // Tanggal
      if (startDate && endDate) {
        params.start_at = formatDate(startDate);
        params.end_at = formatDate(endDate);
      }

      // Cabang
      if (branchFilter) params.branch_id = branchFilter;

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

  const applyFilter = () => {
    setCurrentPage(1);
    fetchReports(1);
  };

  const resetFilters = () => {
    setDateRange([null, null]);
    setBranchFilter("");
    setCurrentPage(1);
    setResetTrigger(true); // fetch setelah semua state reset
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
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2.5 py-1.5 border rounded">«</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded">Prev</button>
          <span className="text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded">Next</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2.5 py-1.5 border rounded">»</button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdInventory className="text-3xl text-gray-700" />
            Laporan Pembelian Harian
          </h1>
        </div>

        {/* FILTER */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">

            {/* Date Range */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Rentang Tanggal</label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable
                dateFormat="dd/MM/yyyy"
                className="border rounded px-3 py-2 w-60"
                placeholderText="Pilih tanggal"
                maxDate={new Date()}
              />
            </div>

            {/* Branch */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Cabang</label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="border rounded px-3 py-2 w-60"
              >
                <option value="">Semua Cabang</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 items-center">
              <button
                onClick={applyFilter}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Terapkan
              </button>

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs uppercase">Cabang</th>
                  <th className="px-6 py-4 text-left text-xs uppercase">Total Transaksi</th>
                  <th className="px-6 py-4 text-left text-xs uppercase">Total Produk Beli</th>
                  <th className="px-6 py-4 text-left text-xs uppercase">Total Pembelian</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex justify-center gap-3">
                        <div className="animate-spin h-8 w-8 border-b-2 border-green-600 rounded-full"></div>
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-gray-600">Tidak ada data</td>
                  </tr>
                ) : (
                  reports.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{formatDateDisplay(r.date)}</td>
                      <td className="px-6 py-4">{r.branch_name}</td>
                      <td className="px-6 py-4">{r.total_transactions}</td>
                      <td className="px-6 py-4">{r.total_products_buy}</td>
                      <td className="px-6 py-4">Rp{r.total_purchases.toLocaleString("id-ID")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
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
