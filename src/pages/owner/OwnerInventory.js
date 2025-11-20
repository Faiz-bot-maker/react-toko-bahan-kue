import React, { useState, useEffect } from "react";
import {
    HiOutlineOfficeBuilding,
    HiOutlineX,
} from "react-icons/hi";

import { TbRulerMeasure } from "react-icons/tb";
import { FiEdit, FiTrash } from "react-icons/fi";
import axios from "axios";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/branch-inventory`;
const API_PRODUCTS = `${process.env.REACT_APP_API_URL}/products`;
const API_BRANCHES = `${process.env.REACT_APP_API_URL}/branches`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const OwnerInventory = () => {
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [loadingSizes, setLoadingSizes] = useState(false);

    // CRUD Modal
    const [crudModal, setCrudModal] = useState({ open: false, mode: "add", data: null });
    const [formData, setFormData] = useState({
        product_sku: "",
        sku: "",
        branch_id: "",
        sell_price: "",
        size_id: "",
    });

    // Data untuk filter & dropdown
    const [searchTerm, setSearchTerm] = useState("");
    const [branchFilter, setBranchFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [branchOptions, setBranchOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [sizeOptions, setSizeOptions] = useState([]);

    // Fetch Branches
    const fetchBranches = async () => {
        try {
            const res = await axios.get(API_BRANCHES, { headers: getHeaders() });
            if (res.data?.data) setBranchOptions(res.data.data);
        } catch (err) {
            console.error("Failed to fetch branches:", err);
        }
    };

    // Fetch Products
    const fetchProducts = async () => {
        try {
            const res = await axios.get(API_PRODUCTS, {
                headers: getHeaders(),
                params: { exclude_sizes: true },
            });
            if (Array.isArray(res.data?.data)) setProductOptions(res.data.data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        }
    };

    // Fetch Inventories
    const fetchInventories = async (page = 1, branch = null, search = "") => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append("page", page);
            if (branch) params.append("branch_id", branch);
            if (search) params.append("search", search);

            const res = await axios.get(`${API_URL}?${params.toString()}`, {
                headers: getHeaders(),
            });

            const data = res.data?.data || [];
            const paging = res.data?.paging || {};
            setInventories(data);
            setCurrentPage(paging.page || 1);
            setTotalPages(paging.total_page || 1);
            setTotalItems(paging.total_item || 0);
        } catch (err) {
            console.error("Failed to fetch inventories:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Sizes
    const fetchSizes = async (sizes) => {
        try {
            setLoadingSizes(true);
            setShowModal(true);
            if (Array.isArray(sizes)) setSizes(sizes);
            else setSizes([]);
        } catch (err) {
            console.error("Failed to fetch sizes:", err);
            setSizes([]);
        } finally {
            setLoadingSizes(false);
        }
    };

    // Fetch Sizes untuk drop-down edit
    const fetchProductSizes = async (sku) => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/products/${sku}/sizes`,
                { headers: getHeaders() }
            );
            if (Array.isArray(res.data?.data)) setSizeOptions(res.data.data);
            else setSizeOptions([]);
        } catch (err) {
            console.error("Failed to fetch product sizes:", err);
            setSizeOptions([]);
        }
    };

    // CRUD
    const handleAdd = async () => {
        try {
            await axios.post(API_URL, formData, { headers: getHeaders() });
            setCrudModal({ open: false, mode: "add", data: null });
            fetchInventories(currentPage, branchFilter, searchTerm);
        } catch (err) {
            console.error("Failed to add inventory:", err);
            alert("Gagal menambah data inventory");
        }
    };

    const handleEdit = async (id) => {
        try {
            await axios.put(`${API_URL}/${id}`, formData, { headers: getHeaders() });
            setCrudModal({ open: false, mode: "edit", data: null });
            fetchInventories(currentPage, branchFilter, searchTerm);
        } catch (err) {
            console.error("Failed to edit inventory:", err);
            alert("Gagal mengubah data");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus data ini?")) {
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
                fetchInventories(currentPage, branchFilter, searchTerm);
            } catch (err) {
                console.error("Failed to delete inventory:", err);
                alert("Gagal menghapus data");
            }
        }
    };

    // Lifecycle
    useEffect(() => {
        fetchBranches();
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchInventories(currentPage, branchFilter, searchTerm);
    }, [currentPage, branchFilter, searchTerm]);

    // Pagination
    const Pagination = ({ page, setPage, totalPages, startIndex, endIndex, total }) => (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
                Menampilkan {total === 0 ? 0 : startIndex + 1}-{endIndex} dari total {total} data
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setPage(1)} disabled={page === 1} className="px-2.5 py-1.5 border rounded">
                    «
                </button>
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border rounded"
                >
                    Prev
                </button>
                <span className="text-sm">{page} / {totalPages}</span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 border rounded"
                >
                    Next
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2.5 py-1.5 border rounded">
                    »
                </button>
            </div>
        </div>
    );

    // Pagination index
    const pageSize = inventories.length || 0;
    const startIndex = (currentPage - 1) * pageSize || 0;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HiOutlineOfficeBuilding className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Inventory Semua Cabang</h1>
                            <p className="text-sm text-gray-600">Lihat & Kelola data inventory cabang</p>
                        </div>
                    </div>
                </div>

                {/* FILTER + RESET */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">

                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Cari produk, SKU, atau cabang..."
                        className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm text-sm"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    {/* Branch Filter */}
                    <select
                        value={branchFilter || ""}
                        onChange={(e) => {
                            setBranchFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-1/4 px-4 py-2 border rounded-lg shadow-sm text-sm"
                    >
                        <option value="">Semua Cabang</option>
                        {branchOptions.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                                {branch.name}
                            </option>
                        ))}
                    </select>

                    {/* RESET BUTTON */}
                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setBranchFilter("");
                            setCurrentPage(1);
                            fetchInventories(1, null, "");
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                    >
                        Reset
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold">Cabang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold">Nama Barang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold">SKU</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-10">Memuat...</td>
                                    </tr>
                                ) : inventories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <h3 className="text-lg font-semibold">Belum ada data inventory</h3>
                                        </td>
                                    </tr>
                                ) : (
                                    inventories.map((item) => (
                                        <tr key={`${item.branch_id}-${item.sku}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{item.branch_name}</td>
                                            <td className="px-6 py-4">{item.name}</td>
                                            <td className="px-6 py-4">{item.sku}</td>
                                            <td className="px-6 py-4 text-right flex gap-2 justify-end">

                                                {/* Lihat Size */}
                                                <button
                                                    onClick={() => fetchSizes(item.sizes)}
                                                    className="p-2 text-green-600 hover:text-green-700"
                                                >
                                                    <TbRulerMeasure size={18} />
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    onClick={() => {
                                                        setCrudModal({ open: true, mode: "edit", data: item });
                                                        setFormData({
                                                            product_sku: item.product_sku,
                                                            sku: item.sku,
                                                            branch_id: item.branch_id,
                                                            sell_price: item.sell_price,
                                                            size_id: item.size_id || "",
                                                        });
                                                        fetchProductSizes(item.sku);
                                                    }}
                                                    className="p-2 text-blue-600 hover:text-blue-700"
                                                >
                                                    <FiEdit size={18} />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-600 hover:text-red-700"
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        page={currentPage}
                        setPage={setCurrentPage}
                        totalPages={totalPages}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        total={totalItems}
                    />
                )}

                {/* CRUD Modal */}
                {crudModal.open && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">

                            <button
                                onClick={() => setCrudModal({ open: false, mode: "add", data: null })}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            >
                                <HiOutlineX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-6">
                                {crudModal.mode === "add" ? "Tambah" : "Edit"} Inventory
                            </h2>

                            <div className="space-y-4">
                                {/* Produk */}
                                <div>
                                    <label className="block text-sm mb-2">Nama Produk</label>
                                    <select
                                        value={formData.product_sku}
                                        onChange={(e) => {
                                            const product = productOptions.find(p => p.sku === e.target.value);
                                            if (product) {
                                                setFormData({
                                                    ...formData,
                                                    product_sku: product.sku,
                                                    sku: product.sku,
                                                    size_id: "",
                                                });
                                                fetchProductSizes(product.sku);
                                            }
                                        }}
                                        className="w-full border px-3 py-2 rounded"
                                    >
                                        <option value="">Pilih Produk</option>
                                        {productOptions.map((p) => (
                                            <option key={p.sku} value={p.sku}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className="block text-sm mb-2">SKU</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formData.sku}
                                        className="w-full border px-3 py-2 bg-gray-100 rounded"
                                    />
                                </div>

                                {/* Ukuran */}
                                <div>
                                    <label className="block text-sm mb-2">Ukuran</label>
                                    <select
                                        value={formData.size_id}
                                        onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                                        disabled={sizeOptions.length === 0}
                                        className="w-full border px-3 py-2 rounded"
                                    >
                                        <option value="">Pilih Ukuran</option>
                                        {sizeOptions.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cabang */}
                                <div>
                                    <label className="block text-sm mb-2">Cabang</label>
                                    <select
                                        value={formData.branch_id}
                                        onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                                        className="w-full border px-3 py-2 rounded"
                                    >
                                        <option value="">Pilih Cabang</option>
                                        {branchOptions.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Harga */}
                                <div>
                                    <label className="block text-sm mb-2">Harga Jual</label>
                                    <input
                                        type="number"
                                        value={formData.sell_price}
                                        onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                                        className="w-full border px-3 py-2 rounded"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setCrudModal({ open: false, mode: "add", data: null })}
                                    className="px-4 py-2 border rounded"
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={() =>
                                        crudModal.mode === "add" ? handleAdd() : handleEdit(crudModal.data.id)
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded"
                                >
                                    {crudModal.mode === "add" ? "Tambah" : "Simpan"}
                                </button>
                            </div>

                        </div>
                    </div>
                )}

                {/* Size modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500"
                            >
                                <HiOutlineX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-6">Daftar Ukuran</h2>

                            {loadingSizes ? (
                                <p className="text-center py-10">Memuat ukuran...</p>
                            ) : sizes.length === 0 ? (
                                <p className="text-center py-10">Tidak ada ukuran tersedia</p>
                            ) : (
                                <ul className="space-y-2">
                                    {sizes.map((size) => (
                                        <li key={size.size_id} className="p-3 border rounded flex justify-between">
                                            <div>
                                                <p className="font-medium">Size: {size.size}</p>
                                                <p className="text-sm text-gray-500">Stok: {size.stock}</p>
                                            </div>
                                            <p className="text-green-600 font-semibold">
                                                Rp {Number(size.sell_price).toLocaleString("id-ID")}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default OwnerInventory;
