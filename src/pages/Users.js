import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiEye, HiEyeOff, HiOutlinePlus } from 'react-icons/hi';

const Users = () => {
  const [users, setUsers] = useState([
    { username: 'admin', password: 'admin123' },
    { username: 'kasir', password: 'kasir123' },
  ]);
  const [modal, setModal] = useState({ open: false, mode: 'add', idx: null });
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const openAdd = () => {
    setForm({ username: '', password: '' });
    setModal({ open: true, mode: 'add', idx: null });
    setShowPassword(false);
  };
  const openEdit = (idx) => {
    setForm(users[idx]);
    setModal({ open: true, mode: 'edit', idx });
    setShowPassword(false);
  };
  const closeModal = () => setModal({ open: false, mode: 'add', idx: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    if (modal.mode === 'add') {
      setUsers([...users, { ...form }]);
    } else {
      setUsers(users.map((u, i) => i === modal.idx ? { ...form } : u));
    }
    closeModal();
  };
  const handleDelete = (idx) => {
    if (window.confirm('Yakin hapus user ini?')) {
      setUsers(users.filter((_, i) => i !== idx));
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
              <h1 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h1>
              <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition">
                <HiOutlinePlus className="text-lg" /> Tambah
              </button>
            </div>
            <div className="overflow-x-auto rounded border border-gray-100 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-green-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">No</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Username</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">Belum ada pengguna.</td>
                    </tr>
                  )}
                  {users.map((user, idx) => (
                    <tr key={user.username} className="border-b border-gray-100 hover:bg-green-50/50">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2 text-gray-800">{user.username}</td>
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
                  <h2 className="font-bold text-lg mb-2">{modal.mode === 'add' ? 'Tambah' : 'Edit'} User</h2>
                  <input type="text" className="border rounded px-3 py-2" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} className="border rounded px-3 py-2 w-full pr-10" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-gray-600 px-1 py-1 rounded hover:bg-gray-100">
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
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

export default Users;
