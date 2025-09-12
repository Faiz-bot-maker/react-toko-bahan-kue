import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import axios from "axios";
import Layout from '../../components/Layout';

const statusColor = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Lunas: 'bg-green-100 text-green-800',
};

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const OwnerLaporanPiutang = () => {
    const [pelanggan, setPelanggan] = useState([]);
    const [modal, setModal] = useState({ open: false, mode: 'add', idx: null });
    const [form, setForm] = useState({ nama: '', total: '', status: 'Pending' });
    const [loading, setLoading] = useState(true);

    const API_URL = `${process.env.REACT_APP_API_URL}/customers`;

    useEffect(() => {
        fetchPelanggan();
    }, []);

    const fetchPelanggan = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL, {
                headers: { "ngrok-skip-browser-warning": "true" },
            });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setPelanggan(data);
        } catch (err) {
            console.error("Gagal fetch data piutang:", err);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setForm({ nama: '', total: '', status: 'Pending' });
        setModal({ open: true, mode: 'add', idx: null });
    };
    const openEdit = (idx) => {
        setForm(pelanggan[idx]);
        setModal({ open: true, mode: 'edit', idx });
    };
    const closeModal = () => setModal({ open: false, mode: 'add', idx: null });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nama || !form.total) return;
        try {
            if (modal.mode === 'add') {
                await axios.post(API_URL, {
                    nama: form.nama,
                    total: Number(form.total),
                    status: form.status,
                }, {
                    headers: { "ngrok-skip-browser-warning": "true" },
                });
            } else {
                await axios.put(`${API_URL}/${pelanggan[modal.idx].id}`, {
                    nama: form.nama,
                    total: Number(form.total),
                    status: form.status,
                }, {
                    headers: { "ngrok-skip-browser-warning": "true" },
                });
            }
            fetchPelanggan();
            closeModal();
        } catch (err) {
            alert('Gagal simpan data piutang!');
        }
    };

    const handleDelete = async (idx) => {
        if (window.confirm('Yakin hapus data piutang ini?')) {
            try {
                await axios.delete(`${API_URL}/${pelanggan[idx].id}`, {
                    headers: { "ngrok-skip-browser-warning": "true" },
                });
                fetchPelanggan();
            } catch (err) {
                alert('Gagal hapus data piutang!');
            }
        }
    };

    // Hitung total piutang
    const totalPiutang = pelanggan
        .filter(p => p.status === 'Pending')
        .reduce((total, p) => total + (p.total || 0), 0);

    // Hitung total yang sudah lunas
    const totalLunas = pelanggan
        .filter(p => p.status === 'Lunas')
        .reduce((total, p) => total + (p.total || 0), 0);

    return (
        <Layout>
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Laporan Piutang</h1>
                                    <p className="text-sm text-gray-600">Kelola data piutang pelanggan</p>
                                </div>
                            </div>
                            <button 
                                onClick={openAdd} 
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
                            >
                                <HiOutlinePlus className="text-lg" /> Tambah Piutang
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium mb-1">Total Piutang</p>
                                        <p className="text-2xl font-bold text-red-600">{formatRupiah(totalPiutang)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Belum dibayar</p>
                                    </div>
                                    <div className="w-14 h-14 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium mb-1">Total Lunas</p>
                                        <p className="text-2xl font-bold text-green-600">{formatRupiah(totalLunas)}</p>
                                        <p className="text-xs text-gray-500 mt-1">Sudah dibayar</p>
                                    </div>
                                    <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                                Nama Pelanggan
                                            </th>
                                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                                Jumlah Piutang
                                            </th>
                                            <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                                Status Pembayaran
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
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                                        <span className="ml-3 text-gray-600">Memuat data...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : pelanggan.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data piutang</h3>
                                                        <p className="text-gray-500 mb-4">Mulai dengan menambahkan data piutang pertama</p>
                                                        <button
                                                            onClick={openAdd}
                                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                        >
                                                            <HiOutlinePlus className="text-base" /> Tambah Piutang Pertama
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            pelanggan.map((p, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">{p.nama}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-gray-700 font-semibold">{formatRupiah(p.total)}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[p.status]}`}>
                                                            {p.status}
                                                        </span>
                                            </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => openEdit(idx)} 
                                                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <FiEdit size={18} />
                                                    </button>
                                                            <button 
                                                                onClick={() => handleDelete(idx)} 
                                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus"
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
                        {modal.open && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-red-100 rounded-lg">
                                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800">
                                                {modal.mode === 'add' ? 'Tambah' : 'Edit'} Data Piutang
                                            </h2>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Nama Pelanggan
                                                </label>
                                                <input 
                                                    type="text" 
                                                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors" 
                                                    placeholder="Masukkan nama pelanggan" 
                                                    value={form.nama} 
                                                    onChange={e => setForm({ ...form, nama: e.target.value })} 
                                                    required 
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Jumlah Piutang
                                                </label>
                                                <input 
                                                    type="number" 
                                                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors" 
                                                    placeholder="Masukkan jumlah piutang" 
                                                    value={form.total} 
                                                    onChange={e => setForm({ ...form, total: e.target.value })} 
                                                    required 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Status Pembayaran
                                                </label>
                                                <select 
                                                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm transition-colors" 
                                                    value={form.status} 
                                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                                >
                                        <option value="Pending">Belum Lunas</option>
                                        <option value="Lunas">Lunas</option>
                                    </select>
                                            </div>
                                            
                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                                <button 
                                                    type="button" 
                                                    onClick={closeModal} 
                                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                                <button 
                                                    type="submit" 
                                                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
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

export default OwnerLaporanPiutang;