import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";

const API_URL = `${process.env.REACT_APP_API_URL}/branches`;

const Cabang = () => {
  const [branches, setBranches] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "add", idx: null });
  const [form, setForm] = useState({ id: null, name: "", address: "" });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    // console.log(localStorage.getItem("authToken"))
    try {
      const res = await axios.get(API_URL, {
        headers: {
          "Authorization": localStorage.getItem("authToken"),
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
            "Authorization": localStorage.getItem("authToken"),
            "ngrok-skip-browser-warning": "true",
          },
        });
      } else {
        await axios.put(`${API_URL}/${form.id}`, form, {
          headers: {
            "Authorization": localStorage.getItem("authToken"),
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
    <div className="flex h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto p-8 min-w-0">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-800">Data Cabang</h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow font-semibold transition text-sm"
              >
                <HiOutlinePlus className="text-base" /> Tambah
              </button>
            </div>

            <div className="overflow-x-auto shadow-lg border border-gray-200 bg-white">
              <table className="min-w-full text-xs text-gray-800 table-fixed">
                <thead className="bg-gray-600 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Nama Cabang</th>
                    <th className="px-4 py-2 text-left font-semibold">Alamat</th>
                    <th className="px-4 py-2 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {branches.map((b, idx) => (
                    <tr key={b.id || idx} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{b.name}</td>
                      <td className="px-4 py-3">{b.address}</td>
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
                  ))}
                </tbody>
              </table>
            </div>

            {modal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white p-6 shadow-2xl w-full max-w-md border border-gray-200">
                  <h2 className="text-xl font-bold mb-4 text-slate-800 border-b border-gray-200 pb-3">
                    {modal.mode === "add" ? "Tambah" : "Edit"} Cabang
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Cabang</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="Masukkan nama cabang"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                      <textarea
                        className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                        placeholder="Masukkan alamat lengkap cabang"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        rows="4"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
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

export default Cabang;
