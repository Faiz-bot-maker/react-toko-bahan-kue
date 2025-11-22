// src/pages/owner/OwnerUsers.js
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { HiEye, HiEyeOff, HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { MdPeople } from 'react-icons/md';
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/users`;
const ROLE_URL = `${process.env.REACT_APP_API_URL}/roles`;
const BRANCH_URL = `${process.env.REACT_APP_API_URL}/branches`;

const OwnerUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', idx: null });
  const [form, setForm] = useState({ username: '', password: '', name: '', address: '', role_id: '', branch_id: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // FILTER
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const getHeaders = () => ({
    "Authorization": localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true"
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { headers: getHeaders() });

      const data = res.data?.data || [];
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

  // OPEN ADD
  const openAdd = () => {
    setForm({ username: '', password: '', name: '', address: '', role_id: '', branch_id: '' });
    setModal({ open: true, mode: 'add', idx: null });
    setShowPassword(false);
  };

  // OPEN EDIT
  const openEdit = (idx) => {
    const user = users[idx];
    setForm({
      username: user.username,
      password: '',
      name: user.name,
      address: user.address,
      role_id: user.role?.id || "",
      branch_id: user.branch?.id || "",
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

      if (modal.mode === "add") {
        await axios.post(API_URL, dataToSend, { headers: getHeaders() });
      } else {
        await axios.put(`${API_URL}/${users[modal.idx].username}`, dataToSend, { headers: getHeaders() });
      }

      fetchUsers();
      closeModal();
    } catch (err) {
      alert("Gagal menyimpan data user!");
    }
  };

  const handleDelete = async (idx) => {
    if (window.confirm("Yakin hapus user ini?")) {
      try {
        await axios.delete(`${API_URL}/${users[idx].username}`, { headers: getHeaders() });
        fetchUsers();
      } catch (err) {
        alert("Gagal hapus user!");
      }
    }
  };

  // FILTERED USERS
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());

    const matchRole = filterRole === "" || u.role?.id === parseInt(filterRole);
    const matchBranch = filterBranch === "" || u.branch?.id === parseInt(filterBranch);

    return matchSearch && matchRole && matchBranch;
  });

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredUsers.length / limit);
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

  const resetFilters = () => {
    setSearch("");
    setFilterRole("");
    setFilterBranch("");
    setPage(1);
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MdPeople className="text-2xl text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Daftar Pengguna</h1>
              <p className="text-sm text-gray-600">Kelola data pengguna sistem</p>
            </div>
          </div>

          {/* BUTTON ADD */}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow"
          >
            <HiOutlinePlus /> Tambah
          </button>
        </div>

        {/* FILTER SECTION */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4 items-end">

          <input
            type="text"
            placeholder="Cari nama atau username…"
            className="px-3 py-2 border rounded-lg w-full md:w-1/4"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg w-full md:w-1/4"
          >
            <option value="">Semua Jabatan</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>

          <select
            value={filterBranch}
            onChange={(e) => { setFilterBranch(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg w-full md:w-1/4"
          >
            <option value="">Semua Cabang</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Reset
          </button>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Nama</th>
                  <th className="px-6 py-4 text-left">Username</th>
                  <th className="px-6 py-4 text-left">Alamat</th>
                  <th className="px-6 py-4 text-left">Jabatan</th>
                  <th className="px-6 py-4 text-left">Cabang</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">Memuat...</td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, idx) => (
                    <tr key={user.username} className="hover:bg-gray-50">

                      <td className="px-6 py-3">{user.name}</td>
                      <td className="px-6 py-3">{user.username}</td>
                      <td className="px-6 py-3">{user.address}</td>
                      <td className="px-6 py-3">{user.role?.name || "-"}</td>
                      <td className="px-6 py-3">{user.branch?.name || "-"}</td>

                      <td className="px-6 py-3 text-right">

                        {/* ICON EDIT */}
                        <button
                          onClick={() => openEdit((page - 1) * limit + idx)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded mr-2"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>

                        {/* ICON DELETE */}
                        <button
                          onClick={() => handleDelete((page - 1) * limit + idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FiTrash />
                        </button>

                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">

              <p className="text-xs text-gray-500">
                Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, filteredUsers.length)} dari {filteredUsers.length} pengguna
              </p>

              <div className="flex gap-2">

                <button
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  className={`px-3 py-1 rounded border ${page === 1 ? "opacity-40" : ""}`}
                >
                  «
                </button>

                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={`px-3 py-1 rounded border ${page === 1 ? "opacity-40" : ""}`}
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded border ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={`px-3 py-1 rounded border ${page === totalPages ? "opacity-40" : ""}`}
                >
                  Next
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  className={`px-3 py-1 rounded border ${page === totalPages ? "opacity-40" : ""}`}
                >
                  »
                </button>

              </div>
            </div>
          )}

        </div>

        {/* MODAL */}
        {modal.open && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">

              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {modal.mode === 'add' ? 'Tambah Pengguna' : 'Edit Pengguna'}
                </h3>
                <button onClick={closeModal}>✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                <div>
                  <label className="block mb-1 font-medium text-sm">Nama</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={modal.mode === "add" ? "Password baru" : "Kosongkan jika tidak diubah"}
                      className="w-full border rounded px-3 py-2 pr-10"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required={modal.mode === "add"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-gray-500"
                    >
                      {showPassword ? <HiEyeOff /> : <HiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">Alamat</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">Jabatan</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    required
                    value={form.role_id}
                    onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  >
                    <option value="">Pilih Jabatan</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-sm">Cabang</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    required
                    value={form.branch_id}
                    onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                  >
                    <option value="">Pilih Cabang</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                    Simpan
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OwnerUsers;
