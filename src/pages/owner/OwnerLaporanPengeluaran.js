// src/pages/owner/OwnerLaporanPengeluaran.js
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { HiOutlineDocumentReport } from "react-icons/hi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ({
  Authorization: localStorage.getItem("authToken"),
  "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) => "Rp " + (angka || 0).toLocaleString("id-ID");

const OwnerLaporanPengeluaran = () => {
  const [summaryRows, setSummaryRows] = useState([]);
  const [totalAll, setTotalAll] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // mapping branch_id -> branch_name
  const [branchMap, setBranchMap] = useState({});

  // state untuk detail
  const [detailRows, setDetailRows] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(true);

  // pagination detail
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  // filter state
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [branchFilter, setBranchFilter] = useState("");

  // Fetch summary (ringkasan)
  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/expenses/consolidated`,
        { headers: getHeaders() }
      );
      const payload = res.data || {};
      const data = Array.isArray(payload.data) ? payload.data : [];
      setSummaryRows(data);
      setTotalAll(payload.total_all_branches || 0);

      // buat mapping branch_id => branch_name
      const mapping = {};
      data.forEach((b) => {
        mapping[b.branch_id] = b.branch_name;
      });
      setBranchMap(mapping);
    } catch (err) {
      console.error("Gagal memuat summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch detail (dengan pagination & filter)
  const fetchDetail = async (pageNumber = 1) => {
    try {
      setLoadingDetail(true);

      const params = new URLSearchParams();
      params.append("page", pageNumber);
      params.append("size", size);

      if (startDate) {
        params.append("start_date", startDate.toISOString().split("T")[0]);
      }
      if (endDate) {
        params.append("end_date", endDate.toISOString().split("T")[0]);
      }
      if (branchFilter) {
        params.append("branch_id", branchFilter);
      }

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/expenses?${params.toString()}`,
        { headers: getHeaders() }
      );
      const payload = res.data || {};
      setDetailRows(Array.isArray(payload.data) ? payload.data : []);
      setTotalPage(payload.paging?.total_page || 1);
    } catch (err) {
      console.error("Gagal memuat detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchDetail(page);
  }, [page]);

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 rounded-xl">
            <HiOutlineDocumentReport className="text-2xl text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Laporan Pengeluaran
            </h1>
            <p className="text-sm text-gray-600">
              Ringkasan total & detail pengeluaran semua cabang
            </p>
          </div>
        </div>

        {/* =================== RINGKASAN =================== */}
        <h2 className="text-xl font-semibold mb-3">Ringkasan Per Cabang</h2>
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden mb-10">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                  Cabang
                </th>
                <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                  Total Pengeluaran
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingSummary ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : summaryRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada data pengeluaran
                  </td>
                </tr>
              ) : (
                summaryRows.map((row, idx) => (
                  <tr key={row.branch_id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {row.branch_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right font-semibold">
                      {formatRupiah(row.total_expenses)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loadingSummary && (
              <tfoot>
                <tr className="bg-gradient-to-r from-gray-200 to-gray-300">
                  <td className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                    Total Semua Cabang
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    {formatRupiah(totalAll)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* =================== DETAIL =================== */}
        <h2 className="text-xl font-semibold mb-3">Detail Pengeluaran</h2>

        {/* Filter */}
        <div className="flex flex-wrap items-end gap-4 mb-4">
          {/* Filter tanggal range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable
              maxDate={new Date()} // ⬅️ hanya bisa pilih sampai hari ini
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih rentang tanggal"
              className="border rounded-md px-3 py-2 text-sm w-60"
            />
          </div>

          {/* Filter cabang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabang
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Semua Cabang</option>
              {Object.entries(branchMap).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setPage(1);
              fetchDetail(1);
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
          >
            Terapkan
          </button>
        </div>

        {/* Tabel Detail */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Cabang
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingDetail ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : detailRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada data detail pengeluaran
                  </td>
                </tr>
              ) : (
                detailRows.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {branchMap[row.branch_id] || `Cabang ${row.branch_id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {row.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right font-semibold">
                      {formatRupiah(row.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination untuk detail */}
        {!loadingDetail && totalPage > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                page === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-800"
              }`}
            >
              Sebelumnya
            </button>

            <div className="text-sm text-gray-600">
              Halaman <span className="font-semibold">{page}</span> dari{" "}
              <span className="font-semibold">{totalPage}</span>
            </div>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPage))}
              disabled={page === totalPage}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                page === totalPage
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-800"
              }`}
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OwnerLaporanPengeluaran;
