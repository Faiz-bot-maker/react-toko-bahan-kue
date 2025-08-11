import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { TbRulerMeasure } from 'react-icons/tb';
import { Link, useNavigate } from 'react-router-dom';
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
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category_id: '', 
    sku: '', 
    sizes: [{ name: '', buy_price: '', sell_price: '' }] 
  });
  const [editValue, setEditValue] = useState({ 
    name: '', 
    category_id: '', 
    sku: '' 
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL, { 
        headers: getHeaders(),
        params: { exclude_sizes: true }
      });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
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
      // Only send basic product data first
      const productData = {
        name: newProduct.name,
        category_id: newProduct.category_id,
        sku: `TKAZ-${newProduct.sku}`
      };

      const response = await axios.post(API_URL, productData, { 
        headers: getHeaders() 
      });
      
      const createdProduct = response.data.data;

      // Now handle sizes separately
      if (newProduct.sizes && newProduct.sizes.length > 0) {
        const sizesToCreate = newProduct.sizes
          .filter(s => s.name.trim() !== '')
          .map(s => ({
            product_id: createdProduct.id,
            name: s.name,
            buy_price: parseInt(s.buy_price) || 0,
            sell_price: parseInt(s.sell_price) || 0
          }));

        if (sizesToCreate.length > 0) {
          await axios.post(`${API_URL}/${createdProduct.sku}/sizes`, sizesToCreate, { 
            headers: getHeaders() 
          });
        }
      }

      setNewProduct({ 
        name: '', 
        category_id: '', 
        sku: '', 
        sizes: [{ name: '', buy_price: '', sell_price: '' }] 
      });
      setModal({ open: false, mode: 'add', data: null });
      
      // Redirect to size management page
      navigate(`/pages/sizeproduct?sku=${createdProduct.sku}`);
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  };

  const handleEditProduct = async (sku) => {
    try {
      const productData = {
        name: editValue.name,
        category_id: editValue.category_id,
        sku: `TKAZ-${editValue.sku}`
      };
      await axios.put(`${API_URL}/${sku}`, productData, { 
        headers: getHeaders() 
      });
      setModal({ open: false, mode: 'add', data: null });
      fetchProducts();
    } catch (err) {
      console.error('Failed to edit product:', err);
    }
  };

  const handleDeleteProduct = async (sku) => {
    try {
      await axios.delete(`${API_URL}/${sku}`, { 
        headers: getHeaders() 
      });
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
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
              <h1 className="text-xl font-bold text-gray-800">Product Data</h1>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded shadow font-semibold transition text-sm"
              >
                <HiOutlinePlus className="text-base" /> Add
              </button>
            </div>

            <div className="overflow-x-auto shadow-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm text-gray-800">
                <thead className="bg-gray-600 text-white uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Product Name</th>
                    <th className="px-6 py-3 text-left font-medium">Category</th>
                    <th className="px-6 py-3 text-left font-medium">SKU</th>
                    <th className="px-6 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.sku} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.category?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/pages/sizeproduct?sku=${product.sku}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Manage Sizes"
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
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit Product"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.sku)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Product"
                          >
                            <FiTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add/Edit Product Modal */}
            {modal.open && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      {modal.mode === 'add' ? 'Add Product' : 'Edit Product'}
                    </h2>
                    
                    {/* Product Form */}
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={modal.mode === 'add' ? newProduct.name : editValue.name}
                          onChange={(e) =>
                            modal.mode === 'add'
                              ? setNewProduct({ ...newProduct, name: e.target.value })
                              : setEditValue({ ...editValue, name: e.target.value })
                          }
                        />
                      </div>
                      
                      {/* Category Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={modal.mode === 'add' ? newProduct.category_id : editValue.category_id}
                          onChange={(e) =>
                            modal.mode === 'add'
                              ? setNewProduct({ ...newProduct, category_id: e.target.value })
                              : setEditValue({ ...editValue, category_id: e.target.value })
                          }
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* SKU Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SKU
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            TKAZ-
                          </span>
                          <input
                            type="text"
                            className="pl-12 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter SKU number"
                            value={modal.mode === 'add' ? newProduct.sku : editValue.sku}
                            onChange={(e) =>
                              modal.mode === 'add'
                                ? setNewProduct({ ...newProduct, sku: e.target.value })
                                : setEditValue({ ...editValue, sku: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      
                      {/* Sizes Section - Only for Add Mode */}
                      {modal.mode === 'add' && (
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-700">
                              Product Sizes
                            </h3>
                            {newProduct.sizes.length < 5 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setNewProduct({
                                    ...newProduct,
                                    sizes: [...newProduct.sizes, { name: '', buy_price: '', sell_price: '' }]
                                  })
                                }
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                + Add Size
                              </button>
                            )}
                          </div>
                          
                          {newProduct.sizes.map((size, index) => (
                            <div key={index} className="border p-3 rounded-md mb-2 bg-gray-50">
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs text-gray-500">Size Name</label>
                                  <input
                                    type="text"
                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                    value={size.name}
                                    onChange={(e) => {
                                      const updatedSizes = [...newProduct.sizes];
                                      updatedSizes[index].name = e.target.value;
                                      setNewProduct({ ...newProduct, sizes: updatedSizes });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Buy Price</label>
                                  <input
                                    type="number"
                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                    value={size.buy_price}
                                    onChange={(e) => {
                                      const updatedSizes = [...newProduct.sizes];
                                      updatedSizes[index].buy_price = e.target.value;
                                      setNewProduct({ ...newProduct, sizes: updatedSizes });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500">Sell Price</label>
                                  <input
                                    type="number"
                                    className="w-full p-1 border border-gray-300 rounded text-sm"
                                    value={size.sell_price}
                                    onChange={(e) => {
                                      const updatedSizes = [...newProduct.sizes];
                                      updatedSizes[index].sell_price = e.target.value;
                                      setNewProduct({ ...newProduct, sizes: updatedSizes });
                                    }}
                                  />
                                </div>
                              </div>
                              {newProduct.sizes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedSizes = newProduct.sizes.filter((_, i) => i !== index);
                                    setNewProduct({ ...newProduct, sizes: updatedSizes });
                                  }}
                                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                                >
                                  Remove Size
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Form Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setModal({ open: false, mode: 'add', data: null })}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={modal.mode === 'add' ? handleAddProduct : () => handleEditProduct(modal.data.sku)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {modal.mode === 'add' ? 'Add Product' : 'Save Changes'}
                      </button>
                    </div>
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