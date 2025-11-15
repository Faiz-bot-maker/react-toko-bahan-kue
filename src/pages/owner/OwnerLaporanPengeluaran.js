import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { HiOutlineDocumentReport } from "react-icons/hi";

const getHeaders = () => ({
  Authorization: localStorage.getItem("authToken"),
  "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) =>
  "Rp " + (angka || 0).toLocaleString("id-ID");

const OwnerLaporanPengeluaran = () => {
  const [summaryRows, setSummaryRows] = useState([]);
  const [totalAll, setTotalAll] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/expenses/consolidated`,
        { headers: getHeaders() }
      );
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setSummaryRows(data);
      setTotalAll(res.data?.total_all_branches || 0);
    } catch (err) {
      console.error("Gagal memuat summary:", err);
      setSummaryRows([]);
      setTotalAll(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <HiOutlineDocumentReport className="text-2xl text-red-600" />
          <h1 className="text-2xl font-bold text-gray-800">Laporan Ringkas Pengeluaran</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cabang</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">Memuat data...</td>
                  </tr>
                ) : summaryRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">Tidak ada data pengeluaran</td>
                  </tr>
                ) : (
                  summaryRows.map((row) => (
                    <tr key={row.branch_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{row.branch_name}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatRupiah(row.total_expenses)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {!loading && summaryRows.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-200 font-bold">
                    <td className="px-6 py-4">Total Semua Cabang</td>
                    <td className="px-6 py-4 text-right text-red-600">{formatRupiah(totalAll)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerLaporanPengeluaran;
