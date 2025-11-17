// src/pages/admin/AdminAlurKas.js
import React, { useState, useEffect } from "react";
import { HiOutlineCurrencyDollar, HiOutlineDocumentReport } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = `${process.env.REACT_APP_API_URL}/cash-bank-transactions`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const formatLocalDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
};

const AdminAlurKas = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState([null, null]);
    const [appliedDateRange, setAppliedDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPage, setTotalPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const adminBranchId = localStorage.getItem("branch_id");

    const fetchTransactions = async (targetPage = page, searchTerm = search) => {
        try {
            setLoading(true);
            let params = { branch_id: adminBranchId, page: targetPage, size };
            const [appliedStart, appliedEnd] = appliedDateRange;
            if (appliedStart && appliedEnd) {
                params.start_at = formatLocalDate(appliedStart);
                params.end_at = formatLocalDate(appliedEnd);
            }
            if (searchTerm) params.search = searchTerm;

            const res = await axios.get(API_URL, { headers: getHeaders(), params });
            setTransactions(res.data?.data || []);
            if (res.data?.paging) {
                setTotalPage(res.data.paging.total_page);
                setTotalItems(res.data.paging.total_item);
            } else {
                setTotalPage(1);
                setTotalItems(res.data?.data?.length || 0);
            }
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
            setTransactions([]);
            setTotalPage(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page, search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedDateRange, page, search]);

    const resetFilters = () => {
        setSearch("");
        setDateRange([null, null]);
        setAppliedDateRange([null, null]);
        setPage(1);
        fetchTransactions(1, "");
    };

    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleDateString("id-ID", { year: "numeric", month: "numeric", day: "numeric" });
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HiOutlineCurrencyDollar className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Alur Kas</h1>
                            <p className="text-sm text-gray-600">Daftar transaksi keluar-masuk kas & bank cabang Anda</p>
                        </div>
                    </div>
                </div>

                {/* Filter + Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    <input
                        type="text"
                        placeholder="Cari deskripsi..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="border rounded px-3 py-2 text-sm w-64"
                    />
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                            const [start, end] = update;
                            if (start && end) {
                                setAppliedDateRange([start, end]);
                                setPage(1);
                            }
                        }}
                        isClearable
                        dateFormat="dd/MM/yyyy"
                        className="border rounded px-3 py-2 text-sm w-60"
                        placeholderText="Pilih rentang tanggal"
                    />
                    <button onClick={resetFilters} className="bg-gray-300 px-4 py-2 rounded">Reset</button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Deskripsi</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Tipe</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Sumber</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">Memuat data...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <HiOutlineDocumentReport className="text-5xl text-gray-300" />
                                                <span className="text-lg font-semibold">Tidak ditemukan transaksi</span>
                                                {/* <p className="text-sm text-gray-400">Coba ubah filter pencarian atau rentang tanggal</p> */}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-700">{trx.description}</td>
                                            <td className="px-6 py-3 text-gray-700">{formatDate(trx.transaction_date)}</td>
                                            <td className={`px-6 py-3 font-semibold ${trx.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                                                {trx.type === "IN" ? "Masuk" : "Keluar"}
                                            </td>
                                            <td className="px-6 py-3 text-gray-700">{trx.source}</td>
                                            <td className="px-6 py-3 text-gray-900 font-semibold">Rp {trx.amount.toLocaleString("id-ID")}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.length > 0 && totalItems > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                Menampilkan {(page - 1) * size + 1}–{Math.min(page * size, totalItems)} dari {totalItems} data
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage(1)} disabled={page === 1} className={`px-2.5 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>«</button>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-3 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Prev</button>
                                <span className="text-sm text-gray-700">{page} / {totalPage}</span>
                                <button onClick={() => setPage(p => Math.min(totalPage, p + 1))} disabled={page === totalPage || totalPage === 0} className={`px-3 py-1.5 rounded border ${page === totalPage || totalPage === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Next</button>
                                <button onClick={() => setPage(totalPage)} disabled={page === totalPage || totalPage === 0} className={`px-2.5 py-1.5 rounded border ${page === totalPage || totalPage === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>»</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AdminAlurKas;
