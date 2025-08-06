import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { HiOutlinePlus } from "react-icons/hi";

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
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Data Cabang</h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition"
              >
                <HiOutlinePlus className="text-lg" /> Tambah
              </button>
            </div>

            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-600 text-white text-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-white-700">Nama Cabang</th>
                    <th className="px-4 py-3 text-left font-semibold text-white-700">Alamat</th>
                    <th className="px-4 py-3 text-left font-semibold text-white-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map((b, idx) => (
                    <tr key={b.id || idx} className="border-b border-gray-100 hover:bg-green-50/50">
                      <td className="px-4 py-2">{b.name}</td>
                      <td className="px-4 py-2">{b.address}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          onClick={() => openEdit(idx)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(idx)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {modal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col gap-4"
                >
                  <h2 className="font-bold text-lg mb-2">
                    {modal.mode === "add" ? "Tambah" : "Edit"} Cabang
                  </h2>
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Branch Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="border rounded px-3 py-2"
                    placeholder="Address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold"
                    >
                      Cancel
                    </button>
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

export default Cabang;
