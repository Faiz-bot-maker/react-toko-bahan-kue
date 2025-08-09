import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
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
    const sku = searchParams.get('sku');

    useEffect(() => {
        if (sku) fetchSizes();
    }, []);

    const fetchSizes = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${sku}/sizes`, {
                headers: getHeaders(),
            });
            setSizes(res.data.data || []);
        } catch (err) {
            console.error('Gagal mengambil ukuran:', err);
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
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/products/${sku}/sizes/${id}`,
                { headers: getHeaders() }
            );
            fetchSizes();
        } catch (err) {
            console.error('Gagal menghapus ukuran:', err);
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
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold text-gray-800">
                                Ukuran Produk (SKU: {sku})
                            </h1>
                            <button
                                onClick={openAdd}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition"
                            >
                                <HiOutlinePlus className="text-lg" /> Tambah
                            </button>
                        </div>

                        <div className="overflow-x-auto shadow-xl border border-gray-200 bg-white rounded">
                            <table className="min-w-full text-sm text-gray-800 table-fixed">
                                <thead className="bg-gray-600 text-white text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold w-1/3">Nama Ukuran</th>
                                        <th className="px-5 py-3 text-left font-semibold w-1/4">Harga Beli</th>
                                        <th className="px-5 py-3 text-left font-semibold w-1/4">Harga Jual</th>
                                        <th className="px-5 py-3 text-right font-semibold w-24"></th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {sizes.map((size) => (
                                        <tr key={size.id} className="border-t hover:bg-slate-50">
                                            <td className="px-5 py-4 font-medium">{size.name}</td>
                                            <td className="px-5 py-4">Rp {size.buy_price?.toLocaleString()}</td>
                                            <td className="px-5 py-4">Rp {size.sell_price?.toLocaleString()}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(size)}
                                                        className="text-yellow-500 hover:text-yellow-600"
                                                        title="Edit Ukuran"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSize(size.id)}
                                                        className="text-red-500 hover:text-red-600"
                                                        title="Hapus Ukuran"
                                                    >
                                                        <FiTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {modal.open && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                                    <h2 className="text-xl font-bold mb-4 text-slate-800">
                                        {modal.mode === 'add' ? 'Tambah Ukuran' : 'Edit Ukuran'}
                                    </h2>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Nama Ukuran"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Harga Beli"
                                            value={formData.buy_price}
                                            onChange={(e) => setFormData({ ...formData, buy_price: parseInt(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Harga Jual"
                                            value={formData.sell_price}
                                            onChange={(e) => setFormData({ ...formData, sell_price: parseInt(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="mt-6 flex justify-end gap-2">
                                        <button
                                            onClick={closeModal}
                                            className="bg-slate-300 px-4 py-2 rounded-lg hover:bg-slate-400"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={
                                                modal.mode === 'add'
                                                    ? handleAddSize
                                                    : () => handleEditSize(modal.data.id)
                                            }
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                        >
                                            {modal.mode === 'add' ? 'Tambah' : 'Simpan'}
                                        </button>
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
