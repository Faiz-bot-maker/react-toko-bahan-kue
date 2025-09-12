import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding, HiOutlineEye, HiOutlineX } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/branch-inventory`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const AdminInventory = () => {
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sizes, setSizes] = useState([]);
    const [loadingSizes, setLoadingSizes] = useState(false);

    useEffect(() => {
        fetchInventories();
    }, []);

    const fetchInventories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL, { headers: getHeaders() });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setInventories(data);
        } catch (err) {
            console.error("Failed to fetch inventories:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSizes = async (sku, name, sizes) => {
        try {
            setLoadingSizes(true);
            setSelectedProduct({ sku, name });
            setShowModal(true);

            setSizes(sizes || []);
        } catch (err) {
            console.error("Failed to fetch sizes:", err);
        } finally {
            setLoadingSizes(false);
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <HiOutlineOfficeBuilding className="text-2xl text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Inventory Cabang</h1>
                        <p className="text-sm text-gray-600">Lihat daftar produk cabang</p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Nama Barang
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        SKU
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">
                                                    Memuat data...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : inventories.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineOfficeBuilding className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Belum ada data inventory
                                                </h3>
                                                <p className="text-gray-500 mb-4 text-sm">
                                                    Data inventory akan muncul di sini setelah tersedia
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    inventories.map((item) => (
                                        <tr key={item.sku} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{item.sku}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => fetchSizes(item.sku, item.name, item.sizes)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <HiOutlineEye className="text-lg" />
                                                    Lihat Ukuran
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Sizes */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
                            {/* Close Button */}
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <HiOutlineX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-4 text-gray-800">
                                Ukuran Produk – {selectedProduct?.name} ({selectedProduct?.sku})
                            </h2>

                            {loadingSizes ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    <span className="ml-3 text-gray-600 text-sm">Memuat ukuran...</span>
                                </div>
                            ) : sizes.length === 0 ? (
                                <p className="text-center text-gray-500 py-12">
                                    Tidak ada ukuran untuk produk ini
                                </p>
                            ) : (
                                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                                                Ukuran
                                            </th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                                                Stok
                                            </th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                                                Harga Jual
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sizes.map((s) => (
                                            <tr key={s.size_id} className="border-t">
                                                <td className="px-4 py-2 text-gray-800">{s.size}</td>
                                                <td className="px-4 py-2 text-gray-600">{s.stock}</td>
                                                <td className="px-4 py-2 text-gray-600">
                                                    Rp {s.sell_price.toLocaleString("id-ID")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminInventory;
