import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { HiOutlineDocumentReport, HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) =>
    "Rp " + (angka || 0).toLocaleString("id-ID");

const AdminLaporanPengeluaran = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    const [modal, setModal] = useState({
        open: false,
        mode: "add",
        data: null,
    });

    const [form, setForm] = useState({
        description: "",
        amount: "",
    });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/expenses`,
                { headers: getHeaders() }
            );
            const rows = res.data?.data || [];
            setExpenses(Array.isArray(rows) ? rows : []);
        } catch (err) {
            console.error("Gagal mengambil data:", err);
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
        setForm({
            description: exp.description || "",
            amount: exp.amount || "",
        });
    };

    const closeModal = () => {
        setModal({ open: false, mode: "add", data: null });
        setForm({ description: "", amount: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                description: form.description,
                amount: Number(form.amount) || 0,
            };

            if (modal.mode === "add") {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/expenses`,
                    payload,
                    { headers: getHeaders() }
                );
            } else {
                await axios.put(
                    `${process.env.REACT_APP_API_URL}/expenses/${modal.data.id}`,
                    payload,
                    { headers: getHeaders() }
                );
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
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/expenses/${exp.id}`,
                { headers: getHeaders() }
            );
            fetchExpenses();
        } catch (err) {
            console.error("Gagal menghapus:", err);
            alert("Gagal menghapus data.");
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <HiOutlineDocumentReport className="text-2xl text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Laporan Pengeluaran Cabang
                            </h1>
                            <p className="text-sm text-gray-600">
                                Kelola pengeluaran cabang Anda
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                    >
                        <HiOutlinePlus className="text-lg" /> Tambah Pengeluaran
                    </button>
                </div>

                {/* Tabel Expenses */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                                        Deskripsi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                                        Jumlah
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">
                                                    Memuat data...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : expenses.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-800">
                                                {row.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800">
                                                {formatRupiah(row.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openEdit(row)}
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                                                    title="Edit"
                                                >
                                                    <FiEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row)}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <FiTrash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Add/Edit */}
                {modal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    {modal.mode === "add" ? "Tambah" : "Edit"} Pengeluaran
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Deskripsi
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                            placeholder="Contoh: Makan siang, Transport"
                                            value={form.description}
                                            onChange={(e) =>
                                                setForm({ ...form, description: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Jumlah
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                            placeholder="0"
                                            value={form.amount}
                                            onChange={(e) =>
                                                setForm({ ...form, amount: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                                        >
                                            Simpan
                                        </button>
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
