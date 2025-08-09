import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import axios from "axios";
import { FiEdit, FiTrash } from 'react-icons/fi';

const statusColor = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Lunas: 'bg-green-100 text-green-800',
};

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const LaporanPiutang = () => {
    const [pelanggan, setPelanggan] = useState([]);
    const [modal, setModal] = useState({ open: false, mode: 'add', idx: null });
    const [form, setForm] = useState({ nama: '', total: '', status: 'Pending' });

    const API_URL = `${process.env.REACT_APP_API_URL}/customers`;

    React.useEffect(() => {
        fetchPelanggan();
    }, []);

    const fetchPelanggan = async () => {
        try {
            const res = await axios.get(API_URL, {
                headers: { "ngrok-skip-browser-warning": "true" },
            });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setPelanggan(data);
        } catch (err) {
            console.error("Gagal fetch data piutang:", err);
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
        <div className="flex h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
                    <Header />
                </div>
                <main className="flex-1 overflow-y-auto p-8 min-w-0">
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold text-gray-800">Laporan Piutang</h1>
                            <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow font-semibold transition text-sm">
                                <HiOutlinePlus className="text-base" /> Tambah
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium">Total Piutang</p>
                                        <p className="text-lg font-bold text-red-600">{formatRupiah(totalPiutang)}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <span className="text-red-600 text-xl">₿</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600 font-medium">Total Lunas</p>
                                        <p className="text-lg font-bold text-green-600">{formatRupiah(totalLunas)}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="text-green-600 text-xl">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto shadow-lg border border-gray-200 bg-white">
                            <table className="min-w-full text-xs text-gray-800 table-fixed">
                                <thead className="bg-gray-600 text-white text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Nama Pelanggan</th>
                                        <th className="px-4 py-2 text-left font-semibold">Jumlah Piutang</th>
                                        <th className="px-4 py-2 text-left font-semibold">Status Pembayaran</th>
                                        <th className="px-4 py-2 text-right font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {pelanggan.map((p, idx) => (
                                        <tr key={idx} className="border-t hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium">{p.nama}</td>
                                            <td className="px-4 py-3">{formatRupiah(p.total)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor[p.status]}`}>{p.status}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2 items-center">
                                                    <button onClick={() => openEdit(idx)} className="text-yellow-500 hover:text-yellow-600" title="Edit">
                                                        <FiEdit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(idx)} className="text-red-500 hover:text-red-600" title="Hapus">
                                                        <FiTrash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {modal.open && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm flex flex-col gap-3">
                                    <h2 className="font-bold text-base mb-2">{modal.mode === 'add' ? 'Tambah' : 'Edit'} Data Piutang</h2>
                                    <input type="text" className="border rounded px-3 py-2 text-sm" placeholder="Nama Pelanggan" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                                    <input type="number" className="border rounded px-3 py-2 text-sm" placeholder="Jumlah Piutang" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} required />
                                    <select className="border rounded px-3 py-2 text-sm" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="Pending">Belum Lunas</option>
                                        <option value="Lunas">Lunas</option>
                                    </select>
                                    <div className="flex gap-2 mt-2">
                                        <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded font-semibold text-sm">Simpan</button>
                                        <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 rounded font-semibold text-sm">Batal</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LaporanPiutang;