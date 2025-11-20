import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { HiOutlineCash, HiOutlineChartBar } from "react-icons/hi";
import { HiOutlineReceiptRefund } from "react-icons/hi2";
import { MdOutlineSavings } from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { MdInfoOutline } from "react-icons/md";

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (value) => {
    if (value === null || value === undefined) return "Rp 0";
    const intVal = parseInt(value);
    return "Rp " + intVal.toLocaleString("id-ID");
};

/* === FIX: Format tanggal manual TANPA UTC (toISOString) === */
const formatLocalDate = (date) => {
    if (!date) return undefined;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const OwnerProfitLossReport = () => {
    const [loading, setLoading] = useState(false);

    const [periodType, setPeriodType] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [report, setReport] = useState(null);

    const fetchReport = async () => {
        try {
            setLoading(true);

            let params = { period: periodType };

            const startAt = formatLocalDate(startDate);
            const endAt = formatLocalDate(endDate);

            /* === FIX: Gunakan start_at & end_at === */
            if (periodType === "daily") {
                params.start_at = startAt;
                params.end_at = startAt; // End sama dengan start
            }

            else if (periodType === "monthly") {
                params.start_at = startAt;
                params.end_at = endAt;
            }

            else if (periodType === "range") {
                params.start_at = startAt;
                params.end_at = endAt;
            }

            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/finance-report/profit-loss`,
                { headers: getHeaders(), params }
            );

            setReport(res.data?.data || null);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Laporan Laba Rugi</h1>
                </div>

                {/* FILTER */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">

                    {/* Periode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
                        <select
                            value={periodType}
                            onChange={(e) => setPeriodType(e.target.value)}
                            className="border rounded px-3 py-2 w-60"
                        >
                            <option value="all">Semua</option>
                            <option value="daily">Harian</option>
                            <option value="monthly">Bulanan</option>
                            <option value="range">Rentang Tanggal</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    {periodType !== "all" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                dateFormat={periodType === "monthly" ? "MM/yyyy" : "dd/MM/yyyy"}
                                showMonthYearPicker={periodType === "monthly"}
                                className="border rounded px-3 py-2 w-60"
                                placeholderText="Pilih tanggal mulai"
                            />
                        </div>
                    )}

                    {/* End Date */}
                    {(periodType === "range" || periodType === "monthly") && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                dateFormat={periodType === "monthly" ? "MM/yyyy" : "dd/MM/yyyy"}
                                showMonthYearPicker={periodType === "monthly"}
                                className="border rounded px-3 py-2 w-60"
                                placeholderText="Pilih tanggal selesai"
                            />
                        </div>
                    )}

                    <button
                        onClick={fetchReport}
                        className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                    >
                        Tampilkan
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Keterangan</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Nominal</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : !report ? (
                                    <tr>
                                        <td colSpan={2} className="px-8 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <MdInfoOutline className="text-4xl text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                    Tidak ada data
                                                </h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {/* Penjualan */}
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-700">
                                                <HiOutlineCash className="text-green-700 text-xl" />
                                                Penjualan
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {formatRupiah(report.sales)}
                                            </td>
                                        </tr>

                                        {/* HPP */}
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-700">
                                                <TbPackage className="text-blue-700 text-xl" />
                                                Harga Pokok Penjualan (HPP)
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {formatRupiah(report.hpp)}
                                            </td>
                                        </tr>

                                        {/* Laba Kotor */}
                                        <tr className="bg-green-50 hover:bg-green-100">
                                            <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                                                <HiOutlineChartBar className="text-green-800 text-xl" />
                                                Laba Kotor
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold">
                                                {formatRupiah(report.gross_profit)}
                                            </td>
                                        </tr>

                                        {/* Pengeluaran */}
                                        <tr className="hover:bg-gray-50">
                                            <td className="px-6 py-4 flex items-center gap-2 font-medium text-gray-700">
                                                <HiOutlineReceiptRefund className="text-red-700 text-xl" />
                                                Total Pengeluaran
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {formatRupiah(report.expenses)}
                                            </td>
                                        </tr>

                                        {/* Laba Bersih */}
                                        <tr className="bg-green-100 hover:bg-green-200">
                                            <td className="px-6 py-4 flex items-center gap-2 font-semibold text-gray-800">
                                                <MdOutlineSavings className="text-green-900 text-xl" />
                                                Laba Bersih
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${
                                                report.net_profit >= 0 ? "text-green-700" : "text-red-700"
                                            }`}>
                                                {formatRupiah(report.net_profit)}
                                            </td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default OwnerProfitLossReport;
