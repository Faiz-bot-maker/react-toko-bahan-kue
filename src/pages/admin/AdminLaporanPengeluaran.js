// src/pages/admin/AdminLaporanPengeluaran.js
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { HiOutlineDocumentReport, HiOutlinePlus, HiOutlineCreditCard } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const formatLocalDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatDate = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("id-ID", { year: "numeric", month: "numeric", day: "numeric" });
};

const formatRupiah = (angka) => "Rp " + (angka || 0).toLocaleString("id-ID");

const AdminLaporanPengeluaran = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, mode: "add", data: null });
    const [form, setForm] = useState({ description: "", amount: "" });

    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPage, setTotalPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState("");

    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    useEffect(() => {
        fetchExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, startDate, endDate]);

    const fetchExpenses = async (targetPage = page) => {
        try {
            setLoading(true);
            let params = { page: targetPage, size };
            if (search) params.search = search;
            if (startDate) params.start_at = formatLocalDate(startDate);
            if (endDate) params.end_at = formatLocalDate(endDate);

            const res = await axios.get(`${process.env.REACT_APP_API_URL}/expenses`, {
                headers: getHeaders(),
                params,
            });

            const rows = res.data?.data || [];
            setExpenses(Array.isArray(rows) ? rows : []);
            if (res.data?.paging) {
                setTotalPage(res.data.paging.total_page);
                setTotalItems(res.data.paging.total_item);
            } else {
                setTotalPage(1);
                setTotalItems(rows.length);
            }
        } catch (err) {
            console.error("Gagal mengambil data:", err);
            setExpenses([]);
            setTotalPage(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setModal({ open: true, mode: "add", data: null });
        setForm({ description: "", amount: "" });
    };

    const openEdit = (exp) => {
        setModal({ open: true, mode: "edit", data: exp });
        setForm({ description: exp.description || "", amount: exp.amount || "" });
    };

    const closeModal = () => {
        setModal({ open: false, mode: "add", data: null });
        setForm({ description: "", amount: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { description: form.description, amount: Number(form.amount) || 0 };
            if (modal.mode === "add") {
                await axios.post(`${process.env.REACT_APP_API_URL}/expenses`, payload, { headers: getHeaders() });
            } else {
                await axios.put(`${process.env.REACT_APP_API_URL}/expenses/${modal.data.id}`, payload, { headers: getHeaders() });
            }
            closeModal();
            fetchExpenses();
        } catch (err) {
            console.error("Gagal menyimpan:", err);
            alert("Gagal menyimpan data.");
        }
    };

    const handleDelete = async (exp) => {
        if (!window.confirm("Yakin ingin menghapus data ini?")) return;
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/expenses/${exp.id}`, { headers: getHeaders() });
            fetchExpenses();
        } catch (err) {
            console.error("Gagal menghapus:", err);
            alert("Gagal menghapus data.");
        }
    };

    const resetFilters = () => {
        setDateRange([null, null]);
        setSearch("");
        setPage(1);
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header with Icon */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <HiOutlineCreditCard className="text-3xl text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Laporan Pengeluaran Cabang</h1>
                            <p className="text-sm text-gray-600">Kelola pengeluaran cabang Anda</p>
                        </div>
                    </div>
                    <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">
                        <HiOutlinePlus className="text-lg" /> Tambah Pengeluaran
                    </button>
                </div>

                {/* Filter Tanggal & Search */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
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
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Deskripsi</label>
                        <input
                            type="text"
                            placeholder="Cari deskripsi..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="border rounded px-3 py-2 text-sm w-80"
                        />
                    </div>
                    <div className="mt-5">
                        <button onClick={resetFilters} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">Reset</button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Tanggal</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Deskripsi</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Jumlah</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                                                <HiOutlineDocumentReport className="text-5xl text-gray-400" />
                                                <span className="text-xl font-semibold">Tidak ada data</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-800">{formatDate(row.created_at)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{row.description}</td>
                                            <td className="px-6 py-4 text-sm text-gray-800">{formatRupiah(row.amount)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => openEdit(row)} className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors mr-2" title="Edit">
                                                    <FiEdit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(row)} className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                                    <FiTrash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {expenses.length > 0 && totalItems > 0 && (
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

                {/* Modal Add/Edit */}
                {modal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">{modal.mode === "add" ? "Tambah" : "Edit"} Pengeluaran</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                            placeholder="Contoh: Makan siang, Transport"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                            placeholder="0"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
                                        <button type="submit" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm">Simpan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminLaporanPengeluaran;
