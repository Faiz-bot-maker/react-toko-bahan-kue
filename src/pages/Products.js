import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { TbRulerMeasure } from 'react-icons/tb';
import { Link } from 'react-router-dom';
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
  const [newProduct, setNewProduct] = useState({ name: '', category_id: '', sku: '', sizes: [{ name: '', buy_price: '', sell_price: '' }] });
  const [editValue, setEditValue] = useState({ name: '', category_id: '', sku: '', sizes: [{ name: '', buy_price: '', sell_price: '' }] });

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
      const sanitizedSizes = (newProduct.sizes || []).map((s) => ({
        name: s.name,
        buy_price: parseInt(s.buy_price) || 0,
        sell_price: parseInt(s.sell_price) || 0,
      }));
      const productData = {
        ...newProduct,
        sku: `TKAZ-${newProduct.sku}`,
        sizes: sanitizedSizes,
      };
      await axios.post(API_URL, productData, { headers: getHeaders() });
      setNewProduct({ name: '', category_id: '', sku: '', sizes: [{ name: '', buy_price: '', sell_price: '' }] });
      setModal({ open: false, mode: 'add', data: null });
      fetchProducts();
    } catch (err) {
      console.error('Gagal menambah produk:', err);
    }
  };

  const handleEditProduct = async (sku) => {
    try {
      const sanitizedSizes = (editValue.sizes || []).map((s) => ({
        name: s.name,
        buy_price: parseInt(s.buy_price) || 0,
        sell_price: parseInt(s.sell_price) || 0,
      }));
      const productData = {
        ...editValue,
        sku: `TKAZ-${editValue.sku}`,
        sizes: sanitizedSizes,
      };
      await axios.put(`${API_URL}/${sku}`, productData, { headers: getHeaders() });
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
    setNewProduct({ name: '', category_id: '', sku: '', sizes: [{ name: '', buy_price: '', sell_price: '' }] });
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
              <h1 className="text-xl font-bold text-gray-800">Data Produk</h1>
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
                    <th className="px-4 py-2 text-left font-semibold w-1/3">Nama Produk</th>
                    <th className="px-4 py-2 text-left font-semibold w-1/4">Kategori</th>
                    <th className="px-4 py-2 text-left font-semibold w-1/4">SKU</th>
                    <th className="px-4 py-2 text-right font-semibold w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {products.map(product => (
                    <tr key={product.sku} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.category.name}</td>
                      <td className="px-4 py-3">{product.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2 items-center">
                          <Link
                            to={`/pages/sizeproduct?sku=${product.sku}`}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                            title="Kelola Ukuran Produk"
                          >
                            <TbRulerMeasure size={16} />
                          </Link>
                          <button
                            onClick={() => {
                              setModal({ open: true, mode: 'edit', data: product });
                              setEditValue({
                                name: product.name,
                                category_id: product.category.id,
                                sku: product.sku.replace('TKAZ-', ''),
                                sizes: (product.sizes && product.sizes.length
                                  ? product.sizes.map(s => ({
                                      name: s.name || s.size || '',
                                      buy_price: s.buy_price ?? '',
                                      sell_price: s.sell_price ?? '',
                                    }))
                                  : [{ name: '', buy_price: '', sell_price: '' }])
                              });
                            }}
                            className="text-yellow-500 hover:text-yellow-600"
                            title="Edit Produk"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.sku)}
                            className="text-red-500 hover:text-red-600"
                            title="Hapus Produk"
                          >
                            <FiTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal */}
            {modal.open && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 shadow-2xl w-full max-w-md border border-gray-200 max-h-[90vh] flex flex-col rounded-lg">
                  <h2 className="text-xl font-bold mb-4 text-slate-800 border-b border-gray-200 pb-3">
                    {modal.mode === 'add' ? 'Tambah Produk' : 'Edit Produk'}
                  </h2>

                  {/* Isi Form Scrollable */}
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {/* Nama Produk */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk</label>
                      <input
                        type="text"
                        placeholder="Masukkan nama produk"
                        value={modal.mode === 'add' ? newProduct.name : editValue.name}
                        onChange={e =>
                          modal.mode === 'add'
                            ? setNewProduct({ ...newProduct, name: e.target.value })
                            : setEditValue({ ...editValue, name: e.target.value })
                        }
                        className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <select
                        value={modal.mode === 'add' ? newProduct.category_id : editValue.category_id}
                        onChange={e =>
                          modal.mode === 'add'
                            ? setNewProduct({ ...newProduct, category_id: parseInt(e.target.value) })
                            : setEditValue({ ...editValue, category_id: parseInt(e.target.value) })
                        }
                        className="w-full border border-gray-300 px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pr-1">
                          TKAZ-
                        </span>
                        <input
                          type="number"
                          placeholder="Masukkan nomor SKU"
                          value={modal.mode === 'add' ? newProduct.sku : editValue.sku}
                          onChange={e =>
                            modal.mode === 'add'
                              ? setNewProduct({ ...newProduct, sku: e.target.value })
                              : setEditValue({ ...editValue, sku: e.target.value })
                          }
                          className="w-full border border-gray-300 px-4 py-3 pl-16 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Ukuran & Harga */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Ukuran & Harga</label>
                        {modal.mode === 'add'
                          ? (newProduct.sizes || []).length < 5 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setNewProduct({
                                    ...newProduct,
                                    sizes: [...(newProduct.sizes || []), { name: '', buy_price: '', sell_price: '' }]
                                  })
                                }
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              >
                                +
                              </button>
                            )
                          : (editValue.sizes || []).length < 5 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setEditValue({
                                    ...editValue,
                                    sizes: [...(editValue.sizes || []), { name: '', buy_price: '', sell_price: '' }]
                                  })
                                }
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              >
                                +
                              </button>
                            )}
                      </div>

                      {(modal.mode === 'add' ? newProduct.sizes : editValue.sizes).map((item, idx) => (
                        <div key={idx} className="mb-3 p-3 border border-gray-200 rounded">
                          <div className="mb-2">
                          <input
                            type="text"
                            placeholder="Ukuran"
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...(modal.mode === 'add' ? newProduct.sizes : editValue.sizes)];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                modal.mode === 'add'
                                  ? setNewProduct({ ...newProduct, sizes: updated })
                                  : setEditValue({ ...editValue, sizes: updated });
                              }}
                              className="w-full border border-gray-300 px-4 py-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Harga Beli"
                              value={item.buy_price}
                            onChange={(e) => {
                              const updated = [...(modal.mode === 'add' ? newProduct.sizes : editValue.sizes)];
                                updated[idx] = { ...updated[idx], buy_price: e.target.value };
                              modal.mode === 'add'
                                ? setNewProduct({ ...newProduct, sizes: updated })
                                : setEditValue({ ...editValue, sizes: updated });
                            }}
                              className="w-full border border-gray-300 px-4 py-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <input
                            type="number"
                              placeholder="Harga Jual"
                              value={item.sell_price}
                            onChange={(e) => {
                              const updated = [...(modal.mode === 'add' ? newProduct.sizes : editValue.sizes)];
                                updated[idx] = { ...updated[idx], sell_price: e.target.value };
                              modal.mode === 'add'
                                ? setNewProduct({ ...newProduct, sizes: updated })
                                : setEditValue({ ...editValue, sizes: updated });
                            }}
                              className="w-full border border-gray-300 px-4 py-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          </div>
                          {(modal.mode === 'add' ? newProduct.sizes.length : editValue.sizes.length) > 1 && (
                            <div className="mt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(modal.mode === 'add' ? newProduct.sizes : editValue.sizes)];
                                updated.splice(idx, 1);
                                modal.mode === 'add'
                                  ? setNewProduct({ ...newProduct, sizes: updated })
                                  : setEditValue({ ...editValue, sizes: updated });
                              }}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                                −
                            </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setModal({ open: false, mode: 'add', data: null })}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={modal.mode === 'add' ? handleAddProduct : () => handleEditProduct(modal.data.sku)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium transition-colors"
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
