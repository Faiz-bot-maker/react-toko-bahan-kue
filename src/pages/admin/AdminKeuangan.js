import React, { useState, useEffect } from 'react';
import { HiOutlineCurrencyDollar, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import axios from 'axios';
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/finance`;

const getHeaders = () => ({
    Authorization: localStorage.getItem('authToken'),
    'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const AdminKeuangan = () => {
    const [financialData, setFinancialData] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [formData, setFormData] = useState({
        type: 'income',
        amount: '',
        description: '',
        date: '',
        category: ''
    });

    useEffect(() => {
        fetchFinancialData();
        fetchTransactions();
    }, []);

    const fetchFinancialData = async () => {
        try {
            const res = await axios.get(`${API_URL}/summary`, { headers: getHeaders() });
            const data = res.data?.data || res.data;
            setFinancialData(data);
        } catch (err) {
            console.error('Failed to fetch financial data:', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/transactions`, { headers: getHeaders() });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTransaction) {
                await axios.put(`${API_URL}/transactions/${editingTransaction.id}`, formData, { headers: getHeaders() });
            } else {
                await axios.post(`${API_URL}/transactions`, formData, { headers: getHeaders() });
            }
            setShowModal(false);
            setEditingTransaction(null);
            setFormData({ type: 'income', amount: '', description: '', date: '', category: '' });
            fetchFinancialData();
            fetchTransactions();
        } catch (err) {
            console.error('Failed to save transaction:', err);
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
            category: transaction.category
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            try {
                await axios.delete(`${API_URL}/transactions/${id}`, { headers: getHeaders() });
                fetchFinancialData();
                fetchTransactions();
            } catch (err) {
                console.error('Failed to delete transaction:', err);
            }
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HiOutlineCurrencyDollar className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
                            <p className="text-sm text-gray-600">Kelola keuangan perusahaan</p>
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-400/30 to-green-100 shadow-green-100 rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Pendapatan</p>
                                <p className="text-2xl font-bold text-gray-800">{formatRupiah(financialData.totalRevenue)}</p>
                            </div>
                            <HiOutlineCurrencyDollar className="text-3xl text-green-500" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-400/30 to-red-100 shadow-red-100 rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Pengeluaran</p>
                                <p className="text-2xl font-bold text-gray-800">{formatRupiah(financialData.totalExpenses)}</p>
                            </div>
                            <HiOutlineCurrencyDollar className="text-3xl text-red-500" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400/30 to-blue-100 shadow-blue-100 rounded-xl p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Laba Bersih</p>
                                <p className="text-2xl font-bold text-gray-800">{formatRupiah(financialData.netProfit)}</p>
                            </div>
                            <HiOutlineCurrencyDollar className="text-3xl text-blue-500" />
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Transaksi Terbaru</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">Jenis</th>
                                    <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">Jumlah</th>
                                    <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineCurrencyDollar className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
                                                <p className="text-gray-500 mb-4 text-sm">Transaksi belum tersedia di sistem</p>
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    Tambah Transaksi Pertama
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(transaction.date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900">{transaction.description}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    transaction.type === 'income' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-medium ${
                                                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'income' ? '+' : '-'}{formatRupiah(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(transaction)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <HiOutlinePencil className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <HiOutlineTrash className="text-sm" />
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

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">
                                {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jenis Transaksi
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="income">Pendapatan</option>
                                        <option value="expense">Pengeluaran</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jumlah
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingTransaction(null);
                                            setFormData({ type: 'income', amount: '', description: '', date: '', category: '' });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        {editingTransaction ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminKeuangan;
