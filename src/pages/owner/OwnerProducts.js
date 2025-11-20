import React, { useState, useEffect } from 'react';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { TbRulerMeasure } from 'react-icons/tb';
import { MdInventory } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/products`;
const API_CATEGORIES = `${process.env.REACT_APP_API_URL}/categories`;

const getHeaders = () => ({
    Authorization: localStorage.getItem('authToken'),
    'ngrok-skip-browser-warning': 'true',
});

const OwnerProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [modal, setModal] = useState({ open: false, mode: null, data: null });
    const [newProduct, setNewProduct] = useState({
        name: '',
        category_id: '',
        sku: '',
        sizes: [],
    });
    const [editValue, setEditValue] = useState({
        name: '',
        category_id: '',
        sku: '',
    });
    const [loading, setLoading] = useState(true);

    // Search & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts(currentPage, searchTerm);
        fetchCategories();
    }, [currentPage, searchTerm]);

    const fetchProducts = async (page = 1, search = '') => {
        try {
            setLoading(true);

            const res = await axios.get(API_URL, {
                headers: getHeaders(),
                params: {
                    page,
                    search,
                    exclude_sizes: true,
                },
            });

            const data = res.data?.data || res.data;
            const paging = res.data?.paging || {};
            const items = Array.isArray(data) ? data : [];

            setProducts(items);
            setCurrentPage(paging.page || 1);
            setTotalPages(paging.total_page || 1);
            setTotalItems(paging.total_item || 0);

            // Jika halaman kosong tapi total ada, kembali ke page 1
            if (items.length === 0 && (paging.total_item || 0) > 0) {
                setCurrentPage(1);
                fetchProducts(1, searchTerm);
            }

        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(API_CATEGORIES, { headers: getHeaders() });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleAddProduct = async () => {
        try {
            const productData = {
                name: newProduct.name,
                category_id: newProduct.category_id,
                sku: `TKAZ-${newProduct.sku}`,
                sizes: [],
            };

            const response = await axios.post(API_URL, productData, { headers: getHeaders() });
            const createdProduct = response.data.data;

            setNewProduct({ name: '', category_id: '', sku: '', sizes: [] });
            setModal({ open: false, mode: 'add', data: null });
            navigate(`/pages/sizeproduct?sku=${createdProduct.sku}`);
        } catch (err) {
            console.error('Failed to add product:', err.response?.data || err.message);
            alert('Gagal menambahkan produk. Pastikan SKU unik dan semua field diisi dengan benar.');
        }
    };

    const handleEditProduct = async (sku) => {
        try {
            const productData = {
                name: editValue.name,
                category_id: editValue.category_id,
                sku: `TKAZ-${editValue.sku}`,
            };

            await axios.put(`${API_URL}/${sku}`, productData, { headers: getHeaders() });
            setModal({ open: false, mode: 'add', data: null });
            fetchProducts(currentPage, searchTerm);
        } catch (err) {
            console.error('Failed to edit product:', err);
            alert('Gagal mengedit produk.');
        }
    };

    const handleDeleteProduct = async (sku) => {
        if (window.confirm('Yakin ingin menghapus produk ini?')) {
            try {
                await axios.delete(`${API_URL}/${sku}`, { headers: getHeaders() });
                fetchProducts(currentPage, searchTerm);
            } catch (err) {
                console.error('Failed to delete product:', err);
                alert('Gagal menghapus produk.');
            }
        }
    };

    const openAdd = () => {
        setModal({ open: true, mode: 'add', data: null });
        setNewProduct({ name: '', category_id: '', sku: '', sizes: [] });
    };

    // Pagination
    const pageSize = products.length || 0;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    const Pagination = ({ page, setPage, totalPages, startIndex, endIndex, total }) => (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
                Menampilkan {total === 0 ? 0 : startIndex + 1}-{endIndex} dari total {total} produk
            </div>

            <div className="flex items-center gap-2">
                <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1.5 border rounded">
                    «
                </button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border rounded">
                    Prev
                </button>
                <span className="text-sm">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border rounded">
                    Next
                </button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 border rounded">
                    »
                </button>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-100 rounded-lg">
                            <MdInventory className="text-2xl text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Data Produk</h1>
                            <p className="text-sm text-gray-600">Kelola informasi produk perusahaan</p>
                        </div>
                    </div>

                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow"
                    >
                        <HiOutlinePlus /> Tambah Produk
                    </button>
                </div>

                {/* Search + Reset Button */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4">

                    <input
                        type="text"
                        placeholder="Cari produk atau SKU..."
                        className="w-full md:w-1/3 px-4 py-2 border rounded-lg text-sm"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setCurrentPage(1);
                            fetchProducts(1, "");
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                    >
                        Reset
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs uppercase">Nama Produk</th>
                                    <th className="px-6 py-4 text-left text-xs uppercase">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs uppercase">SKU</th>
                                    <th className="px-6 py-4 text-right text-xs uppercase">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                                <span className="ml-3 text-gray-600">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <MdInventory className="text-6xl text-gray-300 mb-3" />
                                            <p className="text-gray-600">Tidak ada produk ditemukan</p>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.sku} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">{product.name}</td>
                                            <td className="px-6 py-4">{product.category?.name || '-'}</td>
                                            <td className="px-6 py-4">{product.sku}</td>

                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <Link
                                                    to={`/pages/sizeproduct?sku=${product.sku}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <TbRulerMeasure size={18} />
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        setModal({ open: true, mode: 'edit', data: product });
                                                        setEditValue({
                                                            name: product.name,
                                                            category_id: product.category?.id || '',
                                                            sku: product.sku.replace('TKAZ-', ''),
                                                        });
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                >
                                                    <FiEdit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteProduct(product.sku)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
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
                </div>

                {/* Modal Add/Edit */}
                {modal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-lg w-full max-w-xl shadow-lg p-6">

                            <h2 className="text-xl font-bold mb-6">
                                {modal.mode === 'add' ? 'Tambah Produk' : 'Edit Produk'}
                            </h2>

                            {/* FORM FIELDS */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm">Nama Produk</label>
                                    <input
                                        type="text"
                                        className="w-full border px-3 py-2 rounded"
                                        value={modal.mode === 'add' ? newProduct.name : editValue.name}
                                        onChange={(e) =>
                                            modal.mode === 'add'
                                                ? setNewProduct({ ...newProduct, name: e.target.value })
                                                : setEditValue({ ...editValue, name: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="text-sm">Kategori</label>
                                    <select
                                        className="w-full border px-3 py-2 rounded"
                                        value={
                                            modal.mode === 'add'
                                                ? newProduct.category_id
                                                : editValue.category_id
                                        }
                                        onChange={(e) =>
                                            modal.mode === 'add'
                                                ? setNewProduct({ ...newProduct, category_id: parseInt(e.target.value) })
                                                : setEditValue({ ...editValue, category_id: parseInt(e.target.value) })
                                        }
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {modal.mode === 'add' && (
                                    <div>
                                        <label className="text-sm">SKU</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                TKAZ-
                                            </span>
                                            <input
                                                type="text"
                                                className="w-full border pl-16 px-3 py-2 rounded"
                                                value={newProduct.sku}
                                                onChange={(e) =>
                                                    setNewProduct({ ...newProduct, sku: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setModal({ open: false, mode: null, data: null })}
                                    className="px-4 py-2 border rounded"
                                >
                                    Batal
                                </button>

                                <button
                                    onClick={
                                        modal.mode === 'add'
                                            ? handleAddProduct
                                            : () => handleEditProduct(modal.data.sku)
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded"
                                >
                                    {modal.mode === 'add' ? 'Tambah Produk' : 'Simpan'}
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default OwnerProducts;
