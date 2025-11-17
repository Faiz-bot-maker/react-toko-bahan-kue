import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import { MdBusiness } from "react-icons/md";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/branches`;

const OwnerCabang = () => {
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "add", idx: null });
  const [form, setForm] = useState({ id: null, name: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ⬅️ ERROR STATE

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(API_URL, {
        headers: {
          Authorization: localStorage.getItem("authToken"),
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = res.data?.data || res.data;

      if (!Array.isArray(data)) {
        setError("Format data dari server tidak sesuai");
        setBranches([]);
        return;
      }

      setBranches(data);
    } catch (err) {
      setError("Tidak dapat memuat data cabang. Periksa koneksi atau server API.");
      console.error("Fetch error:", err);
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
      alert("Gagal menyimpan data. Coba lagi.");
      console.error(err);
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
        alert("Gagal menghapus data cabang.");
        console.error(err);
      }
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">

        {/* HEADER */}
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
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold"
          >
            <HiOutlinePlus /> Tambah Cabang
          </button>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase">Nama Cabang</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase">Alamat</th>
                  <th className="px-6 py-4 text-right font-semibold text-xs uppercase">Aksi</th>
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
                ) : branches.length === 0 && !error ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <MdBusiness className="text-6xl text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data cabang</h3>
                      <p className="text-gray-500 mb-4 text-sm">Tambahkan cabang pertama Anda.</p>
                      <button
                        onClick={openAdd}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Tambah Cabang
                      </button>
                    </td>
                  </tr>
                ) : (
                  branches.map((b, idx) => (
                    <tr key={b.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{b.address}</td>
                      <td className="px-6 py-4 flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(idx)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <FiTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL */}
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-md border shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MdBusiness className="text-xl text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {modal.mode === "add" ? "Tambah Cabang" : "Edit Cabang"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nama Cabang</label>
                  <input
                    type="text"
                    className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Alamat</label>
                  <textarea
                    className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows="4"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border rounded-lg text-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                  >
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

export default OwnerCabang;
