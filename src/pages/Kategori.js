import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from 'react-icons/fi';

const API_URL = `${process.env.REACT_APP_API_URL}/categories`;

const Kategori = () => {
    const [categories, setCategories] = useState([]);
    const [modal, setModal] = useState({ open: false, mode: "add", idx: null });
    const [form, setForm] = useState({ id: "", name: "" });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(API_URL, {
                headers: {
                    Authorization: localStorage.getItem("authToken"),
                    "ngrok-skip-browser-warning": "true",
                },
            });

            const data = res.data?.data || res.data;
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.error("Data kategori tidak valid:", res.data);
            }
        } catch (err) {
            console.error("Gagal fetch kategori:", err);
        }
    };

    const openAdd = () => {
        setForm({ name: "", id: "" });
        setModal({ open: true, mode: "add", idx: null });
    };

    const openEdit = (idx) => {
        const item = categories[idx];
        setForm({ name: item.name, id: item.id });
        setModal({ open: true, mode: "edit", idx });
    };

    const closeModal = () => {
        setModal({ open: false, mode: "add", idx: null });
        setForm({ name: "", id: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) return;

        try {
            if (modal.mode === "add") {
                await axios.post(
                    API_URL,
                    { name: form.name },
                    {
                        headers: {
                            Authorization: localStorage.getItem("authToken"),
                            "ngrok-skip-browser-warning": "true",
                        },
                    }
                );
            } else {
                if (!form.id) {
                    console.error("id tidak tersedia saat update");
                    return;
                }

                await axios.put(
                    `${API_URL}/${form.id}`,
                    { name: form.name },
                    {
                        headers: {
                            Authorization: localStorage.getItem("authToken"),
                            "ngrok-skip-browser-warning": "true",
                        },
                    }
                );
            }

            fetchCategories();
            closeModal();
        } catch (err) {
            console.error("Gagal menyimpan kategori:", err);
        }
    };

    const handleDelete = async (idx) => {
        const { id } = categories[idx];
        if (!id) return;
        if (window.confirm("Yakin ingin menghapus kategori ini?")) {
            try {
                await axios.delete(`${API_URL}/${id}`, {
                    headers: {
                        Authorization: localStorage.getItem("authToken"),
                        "ngrok-skip-browser-warning": "true",
                    },
                });
                fetchCategories();
            } catch (err) {
                console.error("Gagal menghapus kategori:", err);
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
                            <h1 className="text-xl font-bold text-gray-800">Data Kategori</h1>
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
                                        <th className="px-4 py-2 text-left font-semibold">Nama</th>
                                        <th className="px-4 py-2 text-right font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {categories.map((b, idx) => (
                                        <tr key={b.id || idx} className="border-t hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium">{b.name}</td>
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
                                <form
                                    onSubmit={handleSubmit}
                                    className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm flex flex-col gap-3"
                                >
                                    <h2 className="font-bold text-base mb-2">
                                        {modal.mode === "add" ? "Tambah" : "Edit"} Kategori
                                    </h2>
                                    <input
                                        type="text"
                                        className="border rounded px-3 py-2 text-sm"
                                        placeholder="Kategori"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded font-semibold text-sm"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 rounded font-semibold text-sm"
                                        >
                                            Batal
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

export default Kategori;
