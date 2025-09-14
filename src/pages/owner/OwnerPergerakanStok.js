// src/pages/owner/OwnerPergerakanStok.js
import React, { useState, useEffect } from "react";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = `${process.env.REACT_APP_API_URL}/inventory-movement`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const OwnerPergerakanStok = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    // filter state
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [branchFilter, setBranchFilter] = useState("");

    // daftar cabang
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        fetchBranches();
        fetchMovements();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/branches`,
                { headers: getHeaders() }
            );
            setBranches(res.data?.data || []);
        } catch (err) {
            console.error("Gagal memuat daftar cabang:", err);
        }
    };

    const fetchMovements = async () => {
        try {
            setLoading(true);
            let params = {};
            if (startDate) params.start_date = startDate.toISOString().split("T")[0];
            if (endDate) params.end_date = endDate.toISOString().split("T")[0];
            if (branchFilter) params.branch_id = branchFilter;

            const res = await axios.get(API_URL, {
                headers: getHeaders(),
                params,
            });

            const data = res.data?.data || [];
            setMovements(data);
        } catch (err) {
            console.error("Failed to fetch inventory movements:", err);
            setMovements([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        const d = new Date(timestamp);
        return d.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Layout>
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <HiOutlineSwitchHorizontal className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Pergerakan Stok</h1>
                            <p className="text-sm text-gray-600">
                                Catatan perubahan stok barang per cabang
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    {/* Filter tanggal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rentang Tanggal
                        </label>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            isClearable={true}
                            dateFormat="dd/MM/yyyy"
                            className="border rounded px-3 py-2 text-sm w-60"
                            placeholderText="Pilih rentang tanggal"
                        />
                    </div>

                    {/* Filter cabang */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cabang
                        </label>
                        <select
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Semua Cabang</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={fetchMovements}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Terapkan
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Cabang
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Produk
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Ukuran
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Referensi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Perubahan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">
                                                    Memuat data...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : movements.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineSwitchHorizontal className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Data tidak ada
                                                </h3>
                                                <p className="text-gray-500 text-sm">
                                                    Tidak ditemukan pergerakan stok sesuai filter
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    movements.map((mv) => (
                                        <tr key={mv.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{mv.id}</td>
                                            <td className="px-6 py-4 text-gray-600">{mv.branch_name}</td>
                                            <td className="px-6 py-4 text-gray-600">{mv.product_name}</td>
                                            <td className="px-6 py-4 text-gray-600">{mv.size_label}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {mv.reference_type} ({mv.reference_key})
                                            </td>
                                            <td
                                                className={`px-6 py-4 font-semibold ${mv.change_qty > 0 ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {mv.change_qty > 0 ? `+${mv.change_qty}` : mv.change_qty}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {formatDate(mv.created_at)}
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

export default OwnerPergerakanStok;
