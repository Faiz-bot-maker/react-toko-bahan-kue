import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout"; 
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import axios from "axios";

const API_URL = `${process.env.REACT_APP_API_URL}/barang-keluar`;

const BarangKeluar = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(API_URL, {
                    headers: {
                        Authorization: localStorage.getItem("authToken"),
                        "ngrok-skip-browser-warning": "true",
                    },
                });
                setData(res.data.data);
            } catch (error) {
                console.error("Gagal fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">
                        Data Barang Keluar
                    </h1>
                    <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">
                        <HiOutlinePlus className="mr-2" />
                        Tambah
                    </button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">
                                        Cabang
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">
                                        Produk
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">
                                        Ukuran
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">
                                        Referensi
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">
                                        Jumlah Keluar
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 border-b">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700 border-b">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center text-gray-500 py-4">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-700 border-b">
                                                {item.branch_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 border-b">
                                                {item.product_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 border-b">
                                                {item.size_label}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 border-b">
                                                {item.reference_type}
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    {item.reference_key}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-red-600 font-medium border-b">
                                                {item.change_qty}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 border-b">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-center border-b">
                                                <div className="flex justify-center space-x-3">
                                                    <button className="text-blue-500 hover:text-blue-700">
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button className="text-red-500 hover:text-red-700">
                                                        <FiTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BarangKeluar;
