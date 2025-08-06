import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import axios from "axios";

const statusColor = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Lunas: 'bg-green-100 text-green-800',
};

const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

const Pelanggan = () => {
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
      console.error("Gagal fetch pelanggan:", err);
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
      alert('Gagal simpan data pelanggan!');
    }
  };

  const handleDelete = async (idx) => {
    if (window.confirm('Yakin hapus pelanggan ini?')) {
      try {
        await axios.delete(`${API_URL}/${pelanggan[idx].id}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        fetchPelanggan();
      } catch (err) {
        alert('Gagal hapus pelanggan!');
      }
    }
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
              <h1 className="text-2xl font-bold text-gray-800">Data Pelanggan</h1>
              <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition">
                <HiOutlinePlus className="text-lg" /> Tambah
              </button>
            </div>
            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-600 text-white text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-white-700">Nama</th>
                    <th className="px-4 py-3 text-left font-semibold text-white-700">Total Belanja</th>
                    <th className="px-4 py-3 text-left font-semibold text-white-700">Status Pembayaran</th>
                    <th className="px-4 py-3 text-left font-semibold text-white-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pelanggan.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-green-50/50">
                      <td className="px-4 py-2">{p.nama}</td>
                      <td className="px-4 py-2">{formatRupiah(p.total)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => openEdit(idx)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs">Edit</button>
                        <button onClick={() => handleDelete(idx)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {modal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col gap-4">
                  <h2 className="font-bold text-lg mb-2">{modal.mode === 'add' ? 'Tambah' : 'Edit'} Pelanggan</h2>
                  <input type="text" className="border rounded px-3 py-2" placeholder="Nama" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                  <input type="number" className="border rounded px-3 py-2" placeholder="Total Belanja" value={form.total} onChange={e => setForm({ ...form, total: e.target.value })} required />
                  <select className="border rounded px-3 py-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="Lunas">Lunas</option>
                  </select>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold">Simpan</button>
                    <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold">Batal</button>
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

export default Pelanggan;
