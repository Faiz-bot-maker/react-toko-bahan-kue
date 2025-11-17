import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import { MdLocalShipping } from "react-icons/md";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/distributors`;

const OwnerDistributor = () => {
  const [distributors, setDistributors] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "add", idx: null });
  const [form, setForm] = useState({ id: null, name: "", address: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: localStorage.getItem("authToken"),
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setDistributors(data);
      else console.error("Data distributor tidak valid:", res.data);
    } catch (err) {
      console.error("Gagal fetch distributor:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ id: null, name: "", address: "" });
    setModal({ open: true, mode: "add", idx: null });
  };

  const openEdit = (idx) => {
    const d = distributors[idx];
    setForm({ id: d.id, name: d.name, address: d.address });
    setModal({ open: true, mode: "edit", idx });
  };

  const closeModal = () =>
    setModal({ open: false, mode: "add", idx: null });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.address.trim()) {
      alert("Nama dan alamat wajib diisi.");
      return;
    }

    try {
      const headers = {
        Authorization: localStorage.getItem("authToken"),
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json",
      };

      if (modal.mode === "add") {
        await axios.post(API_URL, { name: form.name, address: form.address }, { headers });
      } else {
        await axios.put(
          `${API_URL}/${form.id}`,
          { name: form.name, address: form.address },
          { headers }
        );
      }

      fetchDistributors();
      closeModal();
    } catch (err) {
      console.error("Gagal menyimpan distributor:", err);
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (idx) => {
    const id = distributors[idx]?.id;
    if (!id) return;

    if (window.confirm("Yakin ingin menghapus distributor ini?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: localStorage.getItem("authToken"),
            "ngrok-skip-browser-warning": "true",
          },
        });

        fetchDistributors();
      } catch (err) {
        console.error("Gagal menghapus distributor:", err);
        alert(err.response?.data?.message || err.message);
      }
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <MdLocalShipping className="text-2xl text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Data Distributor</h1>
              <p className="text-sm text-gray-600">
                Kelola informasi distributor perusahaan
              </p>
            </div>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all"
          >
            <HiOutlinePlus className="text-lg" /> Tambah Distributor
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                    Nama Distributor
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-4 text-right text-xs uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {/* Loading */}
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-3 text-gray-600 text-sm">
                          Memuat data...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : distributors.length === 0 ? (
                  /* Empty State */
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <MdLocalShipping className="text-6xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">
                          Belum ada data distributor
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Tambahkan distributor pertama Anda
                        </p>

                        <button
                          onClick={openAdd}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <HiOutlinePlus className="text-base" />
                          Tambah Distributor Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Data Rows */
                  distributors.map((d, idx) => (
                    <tr key={d.id || idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {d.name}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                        {d.address}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(idx)}
                            className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg"
                          >
                            <FiEdit size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(idx)}
                            className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg"
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
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MdLocalShipping className="text-xl text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {modal.mode === "add" ? "Tambah" : "Edit"} Distributor
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Distributor
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="Masukkan nama distributor"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat
                    </label>
                    <textarea
                      rows={4}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                      placeholder="Masukkan alamat distributor"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm"
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

export default OwnerDistributor;
