import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineCube, HiOutlineArrowLeft } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/branch-inventory`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const InventorySizes = () => {
    const { sku } = useParams(); // ambil sku dari URL
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSizes();
    }, [sku]);

    const fetchSizes = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/${sku}`, { headers: getHeaders() });
            const data = res.data?.data || res.data;
            setProduct(data);
        } catch (err) {
            console.error("Failed to fetch sizes:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="w-full max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HiOutlineCube className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Ukuran Produk
                            </h1>
                            <p className="text-sm text-gray-600">
                                Daftar ukuran untuk produk <span className="font-semibold">{product?.name}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <HiOutlineArrowLeft className="text-lg" />
                        Kembali
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-green-700 to-green-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Ukuran
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Stok
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Harga Jual
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">
                                                    Memuat data...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : !product || !product.sizes || product.sizes.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineCube className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Belum ada data ukuran
                                                </h3>
                                                <p className="text-gray-500 text-sm">
                                                    Data ukuran produk akan tampil di sini
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    product.sizes.map((size) => (
                                        <tr key={size.size_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                {size.size_id}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{size.size}</td>
                                            <td className="px-6 py-4 text-gray-600">{size.stock}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                Rp {size.sell_price.toLocaleString("id-ID")}
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

export default InventorySizes;
