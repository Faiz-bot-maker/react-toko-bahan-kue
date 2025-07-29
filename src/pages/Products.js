import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const Products = () => {
  const [products, setProducts] = useState([
    { name: 'Tepung Terigu', price: 12000, stock: 10 },
    { name: 'Gula Pasir', price: 15000, stock: 8 },
    { name: 'Mentega', price: 20000, stock: 5 },
    { name: 'Telur Ayam', price: 22000, stock: 12 },
  ]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState({ name: '', price: '', stock: '' });
  const [notif, setNotif] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const showNotif = (msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 2000);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct.name.trim() !== '' && newProduct.price && newProduct.stock) {
      setProducts([...products, { ...newProduct, price: Number(newProduct.price), stock: Number(newProduct.stock) }]);
      setNewProduct({ name: '', price: '', stock: '' });
      setShowAdd(false);
      showNotif('Produk berhasil ditambah!');
    }
  };

  const handleDeleteProduct = (idx) => {
    setProducts(products.filter((_, i) => i !== idx));
    if (editIdx === idx) {
      setEditIdx(null);
      setEditValue({ name: '', price: '', stock: '' });
    }
    showNotif('Produk berhasil dihapus!');
  };

  const handleEditProduct = (idx) => {
    setEditIdx(idx);
    setEditValue(products[idx]);
  };

  const handleSaveEdit = (idx) => {
    if (editValue.name.trim() !== '' && editValue.price && editValue.stock) {
      setProducts(products.map((p, i) => (i === idx ? { ...editValue, price: Number(editValue.price), stock: Number(editValue.stock) } : p)));
      setEditIdx(null);
      setEditValue({ name: '', price: '', stock: '' });
      showNotif('Produk berhasil diubah!');
    }
  };

  const handleCancelEdit = () => {
    setEditIdx(null);
    setEditValue({ name: '', price: '', stock: '' });
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
              <h1 className="text-3xl font-extrabold text-gray-900 drop-shadow">Daftar Produk</h1> 
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold transition"
              >
                <HiOutlinePlus className="text-lg" /> Tambah Produk
              </button>
            </div>
          {notif && (
            <div className="fixed left-1/2 top-10 z-50 -translate-x-1/2 bg-gradient-to-r from-jade-100 to-blue-100 text-jade-800 px-6 py-3 rounded-2xl border border-jade-200 text-base shadow-xl animate-fade-in transition-all duration-300">
              {notif}
            </div>
          )}
            {showAdd && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => { setShowAdd(false); setNewProduct({ name: '', price: '', stock: '' }); }} />
                <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Tambah Produk</h2>
                  <form onSubmit={handleAddProduct} className="w-full flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nama produk baru"
                      value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-jade-400 w-full text-base shadow"
                  autoFocus
            />
                    <input
                      type="number"
                      placeholder="Harga"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-jade-400 w-full text-base shadow"
                    />
                    <input
                      type="number"
                      placeholder="Stok"
                      value={newProduct.stock}
                      onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-jade-400 w-full text-base shadow"
                    />
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold">Simpan</button>
                      <button type="button" onClick={() => setShowAdd(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded font-semibold">Batal</button>
                    </div>
          </form>
                </div>
              </>
            )}
            <div className="overflow-x-auto rounded border border-gray-100 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-green-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Nama Produk</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Harga</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Stok</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-green-50/50">
                      {editIdx === idx ? (
                        <>
                      <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editValue.name}
                      onChange={e => setEditValue({ ...editValue, name: e.target.value })}
                              className="border border-gray-200 rounded px-2 py-1 w-full"
                          />
                      </td>
                      <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editValue.price}
                            onChange={e => setEditValue({ ...editValue, price: e.target.value })}
                              className="border border-gray-200 rounded px-2 py-1 w-full"
                          />
                      </td>
                      <td className="px-4 py-2">
                          <input
                            type="number"
                            value={editValue.stock}
                            onChange={e => setEditValue({ ...editValue, stock: e.target.value })}
                              className="border border-gray-200 rounded px-2 py-1 w-full"
                            />
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <button onClick={() => handleSaveEdit(idx)} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center gap-1"><HiOutlineCheck /> Simpan</button>
                            <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs flex items-center gap-1"><HiOutlineX /> Batal</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2">{p.name}</td>
                          <td className="px-4 py-2">Rp {p.price.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2">{p.stock}</td>
                          <td className="px-4 py-2 flex gap-2">
                            <button onClick={() => handleEditProduct(idx)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs flex items-center gap-1"><HiOutlinePencil /> Edit</button>
                            <button onClick={() => handleDeleteProduct(idx)} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center gap-1"><HiOutlineTrash /> Hapus</button>
                      </td>
                        </>
                      )}
                    </tr>
            ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Products; 