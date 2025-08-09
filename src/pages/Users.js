import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiEye, HiEyeOff, HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/users`;
const ROLE_URL = `${process.env.REACT_APP_API_URL}/roles`;
const BRANCH_URL = `${process.env.REACT_APP_API_URL}/branches`;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', idx: null });
  const [form, setForm] = useState({ username: '', password: '', name: '', address: '', role_id: '', branch_id: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchBranches();
  }, []);

  const getHeaders = () => ({
    "Authorization": localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true"
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL, { headers: getHeaders() });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("Gagal fetch user:", err.response ? err.response.data : err.message);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(ROLE_URL, { headers: getHeaders() });
      setRoles(res.data?.data || []);
    } catch (err) {
      console.error("Gagal fetch role:", err.response ? err.response.data : err.message);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(BRANCH_URL, { headers: getHeaders() });
      setBranches(res.data?.data || []);
    } catch (err) {
      console.error("Gagal fetch cabang:", err.response ? err.response.data : err.message);
    }
  };

  const openAdd = () => {
    setForm({ username: '', password: '', name: '', address: '', role_id: '', branch_id: '' });
    setModal({ open: true, mode: 'add', idx: null });
    setShowPassword(false);
  };

  const openEdit = (idx) => {
    const user = users[idx];
    setForm({
      username: user.username,
      password: '',
      name: user.name,
      address: user.address,
      role_id: user.role?.id || '',
      branch_id: user.branch?.id || ''
    });
    setModal({ open: true, mode: 'edit', idx });
    setShowPassword(false);
  };

  const closeModal = () => setModal({ open: false, mode: 'add', idx: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...form };
      if (modal.mode === 'edit' && !form.password) {
        delete dataToSend.password;
      }

      dataToSend.role_id = parseInt(dataToSend.role_id, 10);
      dataToSend.branch_id = parseInt(dataToSend.branch_id, 10);

      if (modal.mode === 'add') {
        const response = await axios.post(API_URL, dataToSend, { headers: getHeaders() });
        console.log("User  added:", response.data);
      } else {
        const response = await axios.put(`${API_URL}/${users[modal.idx].username}`, dataToSend, { headers: getHeaders() });
        console.log("User  updated:", response.data);
      }
      fetchUsers();
      closeModal();
    } catch (err) {
      console.error("Error saving user:", err.response ? err.response.data : err.message);
      alert('Gagal simpan data user! ' + (err.response ? err.response.data.message : ''));
    }
  };

  const handleDelete = async (idx) => {
    if (window.confirm('Yakin hapus user ini?')) {
      try {
        await axios.delete(`${API_URL}/${users[idx].username}`, { headers: getHeaders() });
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err.response ? err.response.data : err.message);
        alert('Gagal hapus user!');
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
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-800">Daftar Pengguna</h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-[#11493E] hover:bg-green-700 text-white px-3 py-1.5 rounded shadow font-semibold transition text-sm"
              >
                <HiOutlinePlus className="text-base" /> Tambah
              </button>
            </div>
            <div className="overflow-x-auto shadow-lg border border-gray-200 bg-white">
              <table className="min-w-full text-xs text-gray-800 table-fixed">
                <thead className="bg-gray-600 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Username</th>
                    <th className="px-4 py-2 text-left font-semibold">Nama</th>
                    <th className="px-4 py-2 text-left font-semibold">Alamat</th>
                    <th className="px-4 py-2 text-left font-semibold">Jabatan</th>
                    <th className="px-4 py-2 text-left font-semibold">Cabang</th>
                    <th className="px-4 py-2 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-gray-400 border">Belum ada pengguna.</td>
                    </tr>
                  ) : (
                    users.map((user, idx) => (
                      <tr key={user.username} className="border-t hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{user.username}</td>
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3">{user.address}</td>
                        <td className="px-4 py-3">{user.role.name}</td>
                        <td className="px-4 py-3">{user.branch.name}</td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {modal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white p-6 shadow-2xl w-full max-w-md border border-gray-200 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4 text-slate-800 border-b border-gray-200 pb-3 sticky top-0 bg-white">
                    {modal.mode === 'add' ? 'Tambah' : 'Edit'} User
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan username" 
                        value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })} 
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                        required 
                      />
                    </div>

                  <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required={modal.mode === 'add'}
                    />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-8 text-lg text-gray-600"
                      >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan nama lengkap" 
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })} 
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                        required 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                      <textarea
                        placeholder="Masukkan alamat lengkap"
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                        rows="3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                      <select 
                        value={form.role_id} 
                        onChange={e => setForm({ ...form, role_id: parseInt(e.target.value, 10) })}
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                        required
                      >
                    <option value="">Pilih Role</option>
                    {roles.map(role => (
                          <option key={role.name} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                      <select 
                        value={form.branch_id} 
                        onChange={e => setForm({ ...form, branch_id: parseInt(e.target.value, 10) })}
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
                        required
                      >
                    <option value="">Pilih Cabang</option>
                    {branches.map(branch => (
                          <option key={branch.name} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                    <button 
                      type="submit" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 font-medium transition-colors"
                    >
                      Simpan
                    </button>
                    <button 
                      type="button" 
                      onClick={closeModal} 
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 font-medium transition-colors"
                    >
                      Batal
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

export default Users;