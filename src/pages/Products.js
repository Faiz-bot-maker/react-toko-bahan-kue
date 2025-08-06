import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/products`;
const API_CATEGORIES = `${process.env.REACT_APP_API_URL}/categories`;

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [newProduct, setNewProduct] = useState({ name: '', category_id: '', sku: '' });
  const [editValue, setEditValue] = useState({ name: '', category_id: '', sku: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL, { headers: getHeaders() });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Gagal mengambil produk:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_CATEGORIES, { headers: getHeaders() });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post(API_URL, newProduct, { headers: getHeaders() });
      setNewProduct({ name: '', category_id: '', sku: '' });
      setModal({ open: false, mode: 'add', data: null });
      fetchProducts();
    } catch (err) {
      console.error('Gagal menambah produk:', err);
    }
  };

  const handleEditProduct = async (sku) => {
    try {
      await axios.put(`${API_URL}/${sku}`, editValue, { headers: getHeaders() });
      setModal({ open: false, mode: 'add', data: null });
      fetchProducts();
    } catch (err) {
      console.error('Gagal mengedit produk:', err);
    }
  };

  const handleDeleteProduct = async (sku) => {
    try {
      await axios.delete(`${API_URL}/${sku}`, { headers: getHeaders() });
      fetchProducts();
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
    }
  };

  const openAdd = () => {
    setModal({ open: true, mode: 'add', data: null });
    setNewProduct({ name: '', category_id: '', sku: '' });
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
              <h1 className="text-2xl font-bold text-gray-800">Data Produk</h1>
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
                    <th className="px-6 py-3 text-left font-semibold">Nama Produk</th>
                    <th className="px-6 py-3 text-left font-semibold">Kategori</th>
                    <th className="px-6 py-3 text-left font-semibold">SKU</th>
                    <th className="px-6 py-3 text-left font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {products.map(product => (
                    <tr key={product.sku} className="border-t hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">{product.category.name}</td>
                      <td className="px-6 py-4">{product.sku}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setModal({ open: true, mode: 'edit', data: product });
                            setEditValue({
                              name: product.name,
                              category_id: product.category.id,
                              sku: product.sku,
                            });
                          }}
                          className="bg-yellow-500 text-white px-4 py-1.5 rounded-md mr-2 hover:bg-yellow-600 shadow"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.sku)}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600 shadow"
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
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4 text-slate-800">
                    {modal.mode === 'add' ? 'Tambah Produk' : 'Edit Produk'}
                  </h2>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Nama Produk"
                      value={modal.mode === 'add' ? newProduct.name : editValue.name}
                      onChange={e =>
                        modal.mode === 'add'
                          ? setNewProduct({ ...newProduct, name: e.target.value })
                          : setEditValue({ ...editValue, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <select
                      value={modal.mode === 'add' ? newProduct.category_id : editValue.category_id}
                      onChange={e =>
                        modal.mode === 'add'
                          ? setNewProduct({ ...newProduct, category_id: parseInt(e.target.value) })
                          : setEditValue({ ...editValue, category_id: parseInt(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="SKU"
                      value={modal.mode === 'add' ? newProduct.sku : editValue.sku}
                      onChange={e =>
                        modal.mode === 'add'
                          ? setNewProduct({ ...newProduct, sku: e.target.value })
                          : setEditValue({ ...editValue, sku: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setModal({ open: false, mode: 'add', data: null })}
                      className="bg-slate-300 px-4 py-2 rounded-lg hover:bg-slate-400"
                    >
                      Batal
                    </button>
                    <button
                      onClick={
                        modal.mode === 'add'
                          ? handleAddProduct
                          : () => handleEditProduct(modal.data.sku)
                      }
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      {modal.mode === 'add' ? 'Tambah' : 'Simpan'}
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

export default Products;
