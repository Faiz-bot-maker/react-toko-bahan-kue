import React, { useState, useEffect } from 'react';
import { TbRulerMeasure } from 'react-icons/tb';
import { MdInventory } from 'react-icons/md';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/products`;
const API_CATEGORIES = `${process.env.REACT_APP_API_URL}/categories`;

const getHeaders = () => ({
    Authorization: localStorage.getItem('authToken'),
    'ngrok-skip-browser-warning': 'true',
});

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL, {
                headers: getHeaders(),
                params: { exclude_sizes: true }
            });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setProducts(data);
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

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-100 rounded-lg">
                            <MdInventory className="text-2xl text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Daftar Produk</h1>
                            <p className="text-sm text-gray-600">Lihat produk yang tersedia di perusahaan</p>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Nama Produk</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <MdInventory className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada produk</h3>
                                                <p className="text-gray-500 mb-4 text-sm">Produk belum tersedia di sistem</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.sku} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700 text-sm">{product.category?.name || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700 font-mono text-sm">{product.sku}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/pages/sizeproduct?sku=${product.sku}`}
                                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Lihat Ukuran"
                                                    >
                                                        <TbRulerMeasure size={18} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminProducts;