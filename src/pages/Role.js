import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';

const Role = () => {
  const [roles, setRoles] = useState([
    { nama: 'Admin', jumlah: 2 },
    { nama: 'Kasir', jumlah: 3 },
    { nama: 'Gudang', jumlah: 1 },
  ]);
  const [modal, setModal] = useState({ open: false, mode: 'add', idx: null });
  const [form, setForm] = useState({ nama: '', jumlah: '' });

  const openAdd = () => {
    setForm({ nama: '', jumlah: '' });
    setModal({ open: true, mode: 'add', idx: null });
  };
  const openEdit = (idx) => {
    setForm(roles[idx]);
    setModal({ open: true, mode: 'edit', idx });
  };
  const closeModal = () => setModal({ open: false, mode: 'add', idx: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama || form.jumlah === '') return;
    if (modal.mode === 'add') {
      setRoles([...roles, { ...form, jumlah: Number(form.jumlah) }]);
    } else {
      setRoles(roles.map((r, i) => i === modal.idx ? { ...form, jumlah: Number(form.jumlah) } : r));
    }
    closeModal();
  };
  const handleDelete = (idx) => {
    if (window.confirm('Yakin hapus role ini?')) {
      setRoles(roles.filter((_, i) => i !== idx));
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
              <h1 className="text-2xl font-bold text-gray-800">Data Role</h1>
              <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition">
                <HiOutlinePlus className="text-lg" /> Tambah
              </button>
            </div>
            <div className="overflow-x-auto rounded border border-gray-100 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-green-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Jumlah User</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((r, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-green-50/50">
                      <td className="px-4 py-2">{r.nama}</td>
                      <td className="px-4 py-2">{r.jumlah}</td>
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
                  <h2 className="font-bold text-lg mb-2">{modal.mode === 'add' ? 'Tambah' : 'Edit'} Role</h2>
                  <input type="text" className="border rounded px-3 py-2" placeholder="Nama Role" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                  <input type="number" className="border rounded px-3 py-2" placeholder="Jumlah User" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} required />
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

export default Role; 