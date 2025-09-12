import React, { useState, useEffect } from "react";
import {
    HiOutlineCurrencyDollar,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
} from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/finance`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) => "Rp " + angka.toLocaleString("id-ID");

const AdminKeuangan = () => {
    const [financialData, setFinancialData] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal untuk tambah/edit transaksi
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [formData, setFormData] = useState({
        type: "income",
        amount: "",
        description: "",
        date: "",
        category: "",
    });

    useEffect(() => {
        fetchFinancialData();
        fetchTransactions();
    }, []);

    const fetchFinancialData = async () => {
        try {
            const res = await axios.get(`${API_URL}/summary`, {
                headers: getHeaders(),
            });
            setFinancialData(res.data?.data || res.data);
        } catch (err) {
            console.error("Failed to fetch financial data:", err);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/transactions`, {
                headers: getHeaders(),
            });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setTransactions(data);
        } catch (err) {
            console.error("Failed to fetch transactions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                await axios.put(
                    `${API_URL}/transactions/${editingTransaction.id}`,
                    formData,
                    { headers: getHeaders() }
                );
            } else {
                await axios.post(`${API_URL}/transactions`, formData, {
                    headers: getHeaders(),
                });
            }
            setShowModal(false);
            setEditingTransaction(null);
            setFormData({
                type: "income",
                amount: "",
                description: "",
                date: "",
                category: "",
            });
            fetchFinancialData();
            fetchTransactions();
        } catch (err) {
            console.error("Failed to save transaction:", err);
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
            category: transaction.category,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
            try {
                await axios.delete(`${API_URL}/transactions/${id}`, {
                    headers: getHeaders(),
                });
                fetchFinancialData();
                fetchTransactions();
            } catch (err) {
                console.error("Failed to delete transaction:", err);
            }
        }
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
                            <h1 className="text-2xl font-bold text-gray-800">
                                Laporan Keuangan
                            </h1>
                            <p className="text-sm text-gray-600">
                                Pantau pendapatan, pengeluaran, dan laba bersih
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <HiOutlinePlus className="text-sm" />
                        Tambah Transaksi
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-400/30 to-green-100 rounded-xl p-6 border border-gray-100">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            Total Pendapatan
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                            {formatRupiah(financialData.totalRevenue)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-400/30 to-red-100 rounded-xl p-6 border border-gray-100">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            Total Pengeluaran
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                            {formatRupiah(financialData.totalExpenses)}
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400/30 to-blue-100 rounded-xl p-6 border border-gray-100">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            Laba Bersih
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                            {formatRupiah(financialData.netProfit)}
                        </p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Transaksi Keuangan
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Deskripsi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                        Jenis
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                                        Jumlah
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            Loading data...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            Tidak ada transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                {new Date(trx.date).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4">{trx.description}</td>
                                            <td className="px-6 py-4">{trx.category}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${trx.type === "income"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {trx.type === "income"
                                                        ? "Pendapatan"
                                                        : "Pengeluaran"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {trx.type === "income" ? "+" : "-"}
                                                {formatRupiah(trx.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(trx)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <HiOutlinePencil />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(trx.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Jenis</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, type: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                >
                                    <option value="income">Pendapatan</option>
                                    <option value="expense">Pengeluaran</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Jumlah</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, amount: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Deskripsi</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm">Kategori</label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block mb-2 text-sm">Tanggal</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingTransaction(null);
                                    }}
                                    className="flex-1 px-4 py-2 border rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg"
                                >
                                    {editingTransaction ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminKeuangan;
