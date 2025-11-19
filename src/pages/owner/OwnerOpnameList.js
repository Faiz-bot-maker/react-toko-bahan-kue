import React, { useState, useEffect } from "react";
import { HiClipboardList } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_URL}/stock-opname`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const statusColor = {
    draft: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    verified: "bg-blue-100 text-blue-700",
};

const OwnerOpnameList = () => {
    const [opnames, setOpnames] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [branchFilter, setBranchFilter] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        if ((startDate && !endDate) || (!startDate && endDate)) return;
        fetchOpnames(currentPage, searchTerm);
        // eslint-disable-next-line
    }, [startDate, endDate, branchFilter, currentPage, searchTerm]);

    const fetchBranches = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/branches`,
                { headers: getHeaders() }
            );
            setBranches(res.data?.data || []);
        } catch (err) {
            console.error("Gagal memuat daftar cabang:", err);
        }
    };

    const fetchOpnames = async (page = 1, search = "") => {
        try {
            setLoading(true);

            let params = { page, search };

            if (startDate && endDate) {
                const fmt = (d) => new Date(d).toISOString().split("T")[0];
                params.start_at = fmt(startDate);
                params.end_at = fmt(endDate);
            }

            if (branchFilter) params.branch_id = branchFilter;

            const res = await axios.get(API_URL, {
                headers: getHeaders(),
                params,
            });

            const data = res.data?.data || res.data;
            const paging = res.data?.paging || {};

            setOpnames(data);
            setCurrentPage(paging.page || 1);
            setTotalPages(paging.total_page || 1);
            setTotalItems(paging.total_item || 0);
        } catch (err) {
            console.error("Gagal fetch opname:", err);
            setOpnames([]);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setDateRange([null, null]);
        setBranchFilter("");
        setSearchTerm("");
        setCurrentPage(1);
        fetchOpnames(1);
    };

    const formatDate = (ts) => {
        const d = new Date(ts);
        return d.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
    };

    // Pagination indexing
    const pageSize = opnames.length || 0;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <HiClipboardList className="text-2xl text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Stok Opname</h1>
                        <p className="text-gray-600">Daftar semua kegiatan stok opname</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white shadow p-4 rounded-lg flex flex-wrap items-end gap-4 mb-6">

                    {/* Date */}
                    <div>
                        <label className="block text-sm">Tanggal</label>
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(v) => {
                                setCurrentPage(1);
                                setDateRange(v);
                            }}
                            className="border rounded px-3 py-2 w-56"
                            placeholderText="Pilih tanggal"
                            isClearable
                        />
                    </div>

                    {/* Branch */}
                    <div>
                        <label className="block text-sm">Cabang</label>
                        <select
                            value={branchFilter}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setBranchFilter(e.target.value);
                            }}
                            className="border rounded px-3 py-2"
                        >
                            <option value="">Semua Cabang</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm">Cari</label>
                        <input
                            value={searchTerm}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setSearchTerm(e.target.value);
                            }}
                            placeholder="Cari nama pembuat / catatan"
                            className="border rounded px-3 py-2 w-60"
                        />
                    </div>

                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        Reset
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Cabang</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Dibuat Oleh</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10">
                                        <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : opnames.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12">
                                        <div className="flex flex-col items-center text-gray-500">

                                            {/* ICON */}
                                            <div className="mb-3 p-4 bg-gray-100 rounded-full">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-10 w-10 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        d="M9 17v-6a2 2 0 012-2h2m4 0v6a2 2 0 01-2 2H9m0 0V9a2 2 0 012-2h2m4 0v6a2 2 0 01-2 2H9"
                                                    />
                                                </svg>
                                            </div>

                                            {/* TITLE */}
                                            <h3 className="text-lg font-semibold">Data tidak ditemukan</h3>

                                            {/* SUB TEXT */}
                                            <p className="text-sm text-gray-400 mt-1">
                                                Coba ubah filter atau reset pencarian.
                                            </p>

                                            {/* RESET BUTTON */}
                                            <button
                                                onClick={resetFilters}
                                                className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                                            >
                                                Reset Filter
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                opnames.map((op) => (
                                    <tr key={op.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{op.id}</td>
                                        <td className="px-6 py-4">{op.branch_name}</td>
                                        <td className="px-6 py-4">{formatDate(op.date)}</td>
                                        <td className="px-6 py-4">{op.created_by}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                    statusColor[op.status] || "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {op.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/owner/opname/${op.id}`}
                                                className="text-purple-600 hover:underline"
                                            >
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">

                        <div className="text-xs text-gray-500">
                            Menampilkan {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} dari total {totalItems} data
                        </div>

                        <div className="flex items-center gap-2">

                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="px-2.5 py-1.5 border rounded disabled:opacity-40"
                            >
                                «
                            </button>

                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border rounded disabled:opacity-40"
                            >
                                Prev
                            </button>

                            <span className="text-sm">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border rounded disabled:opacity-40"
                            >
                                Next
                            </button>

                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="px-2.5 py-1.5 border rounded disabled:opacity-40"
                            >
                                »
                            </button>

                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default OwnerOpnameList;
