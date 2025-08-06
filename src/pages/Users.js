import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiEye, HiEyeOff, HiOutlinePlus } from 'react-icons/hi';
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
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-[#11493E] hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition"
              >
                <HiOutlinePlus className="text-lg" /> Tambah
              </button>
            </div>
            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-gray-800 border border-gray-300 rounded-lg">
                <thead className="bg-gray-500 text-white text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left border-t border-b border-white-300">Username</th>
                    <th className="px-6 py-3 text-left border-t border-b border-white-300">Nama</th>
                    <th className="px-6 py-3 text-left border-t border-b border-white-300">Alamat</th>
                    <th className="px-6 py-3 text-left border-t border-b border-white-300">Jabatan</th>
                    <th className="px-6 py-3 text-left border-t border-b border-white-300">Cabang</th>
                    <th className="px-6 py-3 text-left border-t border-b border-white-300">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-gray-400 border border-gray-300">Belum ada pengguna.</td>
                    </tr>
                  ) : (
                    users.map((user, idx) => (
                      <tr key={user.username} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}>
                        <td className="px-6 py-3 border-b border-gray-300">{user.username}</td>
                        <td className="px-6 py-3 border-b border-gray-300">{user.name}</td>
                        <td className="px-6 py-3 border-b border-gray-300">{user.address}</td>
                        <td className="px-6 py-3 border-b border-gray-300">{user.role.name}</td>
                        <td className="px-6 py-3 border-b border-gray-300">{user.branch.name}</td>
                        <td className="px-6 py-3 border-b border-gray-300">
                          <div className="flex gap-2"> 
                            <button
                              onClick={() => openEdit(idx)}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm shadow-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(idx)}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm shadow-sm"
                            >
                              Hapus
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
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
                  <h2 className="font-bold text-lg mb-2">{modal.mode === 'add' ? 'Tambah' : 'Edit'} User</h2>

                  <input type="text" placeholder="Username" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })} className="border px-3 py-2 rounded" required />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="border px-3 py-2 w-full rounded pr-10"
                      required={modal.mode === 'add'}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-gray-600">
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>

                  <input type="text" placeholder="Nama" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} className="border px-3 py-2 rounded" required />

                  <input type="text" placeholder="Alamat" value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })} className="border px-3 py-2 rounded" required />

                  <select value={form.role_id} onChange={e => setForm({ ...form, role_id: parseInt(e.target.value, 10) })}
                    className="border px-3 py-2 rounded" required>
                    <option value="">Pilih Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>

                  <select value={form.branch_id} onChange={e => setForm({ ...form, branch_id: parseInt(e.target.value, 10) })}
                    className="border px-3 py-2 rounded" required>
                    <option value="">Pilih Cabang</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
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

export default Users;