// src/pages/owner/OwnerAlurKas.js
import React, { useState, useEffect } from "react";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = `${process.env.REACT_APP_API_URL}/cash-bank-transactions`;
const API_BRANCHES = `${process.env.REACT_APP_API_URL}/branches`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const OwnerAlurKas = () => {
    const [transactions, setTransactions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [branchFilter, setBranchFilter] = useState("");
    const [search, setSearch] = useState("");

    // 🔥 Tambahan filter baru
    const [typeFilter, setTypeFilter] = useState("");
    const [sourceFilter, setSourceFilter] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchTransactions(page);
    }, [page, startDate, endDate, branchFilter, search, typeFilter, sourceFilter]);

    const fetchBranches = async () => {
        try {
            const res = await axios.get(API_BRANCHES, { headers: getHeaders() });
            setBranches(res.data?.data || []);
        } catch (err) {
            console.error("Gagal memuat daftar cabang:", err);
        }
    };

    const fetchTransactions = async (pageNumber = page) => {
        try {
            setLoading(true);

            let params = { page: pageNumber, limit };

            if (startDate) params.start_at = startDate.toISOString().split("T")[0];
            if (endDate) params.end_at = endDate.toISOString().split("T")[0];
            if (branchFilter) params.branch_id = branchFilter;
            if (search) params.description = search;

            // 🔥 Filter baru
            if (typeFilter) params.type = typeFilter;
            if (sourceFilter) params.source = sourceFilter;

            const res = await axios.get(API_URL, { headers: getHeaders(), params });

            const data = Array.isArray(res.data?.data) ? res.data.data : [];
            const paging = res.data?.paging || {};

            setTransactions(data);
            setPage(paging.page || 1);
            setTotalPages(paging.total_page || 1);
            setTotalItems(paging.total_item || 0);
        } catch (err) {
            console.error("Gagal memuat transaksi:", err);
            setTransactions([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setDateRange([null, null]);
        setBranchFilter("");
        setSearch("");
        setTypeFilter("");
        setSourceFilter("");
        setPage(1);
    };

    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
    };

    // Pagination Component
    const Pagination = ({ page, setPage, totalPages, total, perPage }) => {
        const startIndex = (page - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, total);

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Menampilkan {total === 0 ? 0 : startIndex + 1}-{endIndex} dari {total} transaksi
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className={`px-2.5 py-1.5 rounded border ${page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        «
                    </button>
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`px-3 py-1.5 rounded border ${page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
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
                        className={`px-3 py-1.5 rounded border ${page === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Next
                    </button>
                    <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className={`px-2.5 py-1.5 rounded border ${page === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
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
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HiOutlineCurrencyDollar className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Alur Kas</h1>
                            <p className="text-sm text-gray-600">Daftar transaksi keluar-masuk kas & bank</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">

                    {/* Rentang tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal</label>
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            isClearable
                            dateFormat="dd/MM/yyyy"
                            className="border rounded px-3 py-2 text-sm w-60"
                            placeholderText="Pilih rentang tanggal"
                            maxDate={new Date()}
                        />
                    </div>

                    {/* Cabang */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
                        <select
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Semua Cabang</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Deskripsi</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Ketik deskripsi..."
                            className="border rounded px-3 py-2 text-sm w-60"
                        />
                    </div>

                    {/* 🔥 Filter TYPE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            className="border rounded px-3 py-2 text-sm w-40"
                        >
                            <option value="">Semua</option>
                            <option value="IN">Masuk</option>
                            <option value="OUT">Keluar</option>
                        </select>
                    </div>

                    {/* 🔥 Filter SOURCE */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sumber</label>
                        <input
                            type="text"
                            value={sourceFilter}
                            onChange={(e) => {
                                setSourceFilter(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Ketik sumber..."
                            className="border rounded px-3 py-2 text-sm w-60"
                        />
                    </div>

                    {/* Reset */}
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">No</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cabang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tipe</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Sumber</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Jumlah</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center text-gray-500">
                                                <div className="p-4 bg-gray-100 rounded-full mb-3">
                                                    <svg
                                                        className="w-10 h-10 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path d="M3 3h18v4H3z" />
                                                        <path d="M3 7l2 14h14l2-14H3z" />
                                                    </svg>
                                                </div>

                                                <h3 className="text-base font-semibold text-gray-700 mb-1">
                                                    Tidak ada transaksi
                                                </h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx, idx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{(page - 1) * limit + idx + 1}</td>
                                            <td className="px-6 py-4">{formatDate(trx.transaction_date)}</td>
                                            <td className="px-6 py-4">{trx.branch_name}</td>
                                            <td className={`px-6 py-4 font-semibold ${trx.type === "IN" ? "text-green-600" : "text-red-600"}`}>
                                                {trx.type === "IN" ? "Masuk" : "Keluar"}
                                            </td>
                                            <td className="px-6 py-4">{trx.source}</td>
                                            <td className="px-6 py-4">{trx.description}</td>
                                            <td className="px-6 py-4 font-medium">Rp {trx.amount.toLocaleString("id-ID")}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination page={page} setPage={setPage} totalPages={totalPages} total={totalItems} perPage={transactions.length} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default OwnerAlurKas;
