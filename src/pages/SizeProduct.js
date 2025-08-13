import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { TbRulerMeasure } from 'react-icons/tb';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const getHeaders = () => ({
    Authorization: localStorage.getItem('authToken'),
    'ngrok-skip-browser-warning': 'true',
});

const SizeProduct = () => {
    const [sizes, setSizes] = useState([]);
    const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
    const [formData, setFormData] = useState({ name: '', buy_price: '', sell_price: '' });
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const sku = searchParams.get('sku');

    useEffect(() => {
        if (sku) fetchSizes();
    }, []);

    const fetchSizes = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${sku}/sizes`, {
                headers: getHeaders(),
            });
            setSizes(res.data.data || []);
        } catch (err) {
            console.error('Gagal mengambil ukuran:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSize = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/products/${sku}/sizes`,
                formData,
                { headers: getHeaders() }
            );
            closeModal();
            fetchSizes();
        } catch (err) {
            console.error('Gagal menambah ukuran:', err);
        }
    };

    const handleEditSize = async (id) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/products/${sku}/sizes/${id}`,
                formData,
                { headers: getHeaders() }
            );
            closeModal();
            fetchSizes();
        } catch (err) {
            console.error('Gagal mengedit ukuran:', err);
        }
    };

    const handleDeleteSize = async (id) => {
        if (window.confirm('Yakin ingin menghapus ukuran ini?')) {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/products/${sku}/sizes/${id}`,
                { headers: getHeaders() }
            );
            fetchSizes();
        } catch (err) {
            console.error('Gagal menghapus ukuran:', err);
            }
        }
    };

    const openAdd = () => {
        setModal({ open: true, mode: 'add', data: null });
        setFormData({ name: '', buy_price: '', sell_price: '' });
    };

    const openEdit = (size) => {
        setModal({ open: true, mode: 'edit', data: size });
        setFormData({
            name: size.name,
            buy_price: size.buy_price,
            sell_price: size.sell_price,
        });
    };

    const closeModal = () => {
        setModal({ open: false, mode: 'add', data: null });
        setFormData({ name: '', buy_price: '', sell_price: '' });
    };

    return (
        <div className="flex h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
                    <Header />
                </div>
                <main className="flex-1 overflow-y-auto p-8 min-w-0">
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-teal-100 rounded-lg">
                                    <TbRulerMeasure className="text-2xl text-teal-600" />
                                </div>
                                <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                        Ukuran Produk
                            </h1>
                                    <p className="text-sm text-gray-600">SKU: {sku}</p>
                                </div>
                            </div>
                            <button
                                onClick={openAdd}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
                            >
                                <HiOutlinePlus className="text-lg" /> Tambah Ukuran
                            </button>
                        </div>

                        {/* Table Section */}
                        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                                Nama Ukuran
                                            </th>
                                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                                Harga Beli
                                            </th>
                                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                                Harga Jual
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                                                Aksi
                                            </th>
                                    </tr>
                                </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                                        <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : sizes.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <TbRulerMeasure className="text-6xl text-gray-300 mb-4" />
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data ukuran</h3>
                                                        <p className="text-gray-500 mb-4 text-sm">Mulai dengan menambahkan ukuran pertama untuk produk ini</p>
                                                        <button
                                                            onClick={openAdd}
                                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                                                        >
                                                            <HiOutlinePlus className="text-base" /> Tambah Ukuran Pertama
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            sizes.map((size) => (
                                                <tr key={size.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 text-sm">{size.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-700 text-sm">Rp {size.buy_price?.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-700 text-sm">Rp {size.sell_price?.toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(size)}
                                                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Ukuran"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSize(size.id)}
                                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Ukuran"
                                                    >
                                                        <FiTrash size={18} />
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
                        {modal.open && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-teal-100 rounded-lg">
                                                <TbRulerMeasure className="text-xl text-teal-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800">
                                                {modal.mode === 'add' ? 'Tambah' : 'Edit'} Ukuran
                                    </h2>
                                        </div>

                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            modal.mode === 'add' ? handleAddSize() : handleEditSize(modal.data.id);
                                        }} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Nama Ukuran
                                                </label>
                                        <input
                                            type="text"
                                                    placeholder="Contoh: S, M, L, XL"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
                                                    required
                                                    autoFocus
                                        />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Harga Beli
                                                </label>
                                        <input
                                            type="number"
                                                    placeholder="Masukkan harga beli"
                                            value={formData.buy_price}
                                                    onChange={(e) => setFormData({ ...formData, buy_price: parseInt(e.target.value) || '' })}
                                                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
                                                    required
                                        />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Harga Jual
                                                </label>
                                        <input
                                            type="number"
                                                    placeholder="Masukkan harga jual"
                                            value={formData.sell_price}
                                                    onChange={(e) => setFormData({ ...formData, sell_price: parseInt(e.target.value) || '' })}
                                                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
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
                                            {modal.mode === 'add' ? 'Tambah' : 'Simpan'}
                                        </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SizeProduct;
