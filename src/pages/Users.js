import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
import Layout from '../components/Layout';
import { HiEye, HiEyeOff, HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { MdPeople } from 'react-icons/md';
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
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const res = await axios.get(API_URL, { headers: getHeaders() });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("Gagal fetch user:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
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
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MdPeople className="text-2xl text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h1>
              <p className="text-sm text-gray-600">Kelola data pengguna sistem</p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
          >
            <HiOutlinePlus className="text-lg" /> Tambah Pengguna
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                    Jabatan
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                    Cabang
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : (
                  users.map((user, i) => (
                    <tr key={user.username} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.address}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.role?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.branch?.name || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        <button
                          onClick={() => openEdit(i)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium mr-3"
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(i)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                        >
                          <FiTrash /> Hapus
                        </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {modal.mode === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      placeholder="Masukkan nama lengkap"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      placeholder="Masukkan username" 
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full border border-gray-300 px-4 py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                        placeholder={modal.mode === 'add' ? "Masukkan password" : "Kosongkan jika tidak ingin mengubah"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required={modal.mode === 'add'}
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <HiEyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat
                    </label>
                    <textarea
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none transition-colors"
                      placeholder="Masukkan alamat lengkap"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jabatan
                    </label>
                    <select 
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      value={form.role_id} 
                      onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Jabatan</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cabang
                    </label>
                    <select 
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      value={form.branch_id} 
                      onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Cabang</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
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
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
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

export default Users;