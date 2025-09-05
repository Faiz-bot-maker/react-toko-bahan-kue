import React, { useState, useEffect } from "react";
import axios from "axios";
// import Sidebar from "../components/Sidebar";
// import Header from "../components/Header";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import { MdBusiness } from "react-icons/md";
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/branches`;

const Cabang = () => {
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "add", idx: null });
  const [form, setForm] = useState({ id: null, name: "", address: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: localStorage.getItem("authToken"),
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        setBranches(data);
      } else {
        console.error("Data cabang tidak valid:", res.data);
      }
    } catch (err) {
      console.error("Gagal fetch cabang:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ id: null, name: "", address: "" });
    setModal({ open: true, mode: "add", idx: null });
  };

  const openEdit = (idx) => {
    setForm(branches[idx]);
    setModal({ open: true, mode: "edit", idx });
  };

  const closeModal = () => setModal({ open: false, mode: "add", idx: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address) return;

    try {
      if (modal.mode === "add") {
        await axios.post(API_URL, form, {
          headers: {
            Authorization: localStorage.getItem("authToken"),
            "ngrok-skip-browser-warning": "true",
          },
        });
      } else {
        await axios.put(`${API_URL}/${form.id}`, form, {
          headers: {
            Authorization: localStorage.getItem("authToken"),
            "ngrok-skip-browser-warning": "true",
          },
        });
      }

      fetchBranches();
      closeModal();
    } catch (err) {
      console.error("Gagal menyimpan cabang:", err);
    }
  };

  const handleDelete = async (idx) => {
    const id = branches[idx].id;
    if (!id) return;
    if (window.confirm("Yakin ingin menghapus cabang ini?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        fetchBranches();
      } catch (err) {
        console.error("Gagal menghapus cabang:", err);
      }
    }
  };

  return (
    <Layout>
          <div className="w-full max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MdBusiness className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Data Cabang</h1>
                  <p className="text-sm text-gray-600">Kelola informasi cabang perusahaan</p>
                </div>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
              >
                <HiOutlinePlus className="text-lg" /> Tambah Cabang
              </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                      Nama Cabang
                    </th>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                      Alamat
                    </th>
                      <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                        Aksi
                      </th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : branches.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <MdBusiness className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data cabang</h3>
                            <p className="text-gray-500 mb-4 text-sm">Mulai dengan menambahkan cabang pertama Anda</p>
                            <button
                              onClick={openAdd}
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                              <HiOutlinePlus className="text-base" /> Tambah Cabang Pertama
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      branches.map((b, idx) => (
                        <tr key={b.id || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900 text-sm">{b.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-700 max-w-md truncate text-sm">{b.address}</div>
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

            {/* Modal */}
            {modal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MdBusiness className="text-xl text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800">
                    {modal.mode === "add" ? "Tambah" : "Edit"} Cabang
                  </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nama Cabang
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                          placeholder="Masukkan nama cabang"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          required
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alamat
                        </label>
                        <textarea
                          className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none transition-colors"
                          placeholder="Masukkan alamat lengkap cabang"
                          value={form.address}
                          onChange={(e) =>
                            setForm({ ...form, address: e.target.value })
                          }
                          rows="4"
                          required
                        />
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

export default Cabang;