import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { HiClipboardList } from "react-icons/hi";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = `${process.env.REACT_APP_API_URL}/stock-opname`;

const getHeaders = () => ({
    Authorization: localStorage.getItem("authToken"),
    "ngrok-skip-browser-warning": "true",
});

const OwnerOpnameDetail = () => {
    const { id } = useParams();
    const [opname, setOpname] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
        // eslint-disable-next-line
    }, []);

    const fetchDetail = async () => {
        try {
            const res = await axios.get(`${API_URL}/${id}`, {
                headers: getHeaders(),
            });
            setOpname(res.data?.data);
        } catch (err) {
            console.error("Gagal memuat detail opname:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (ts) => {
        if (!ts) return "-";
        return new Date(ts).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-b-2 border-purple-600 rounded-full"></div>
                </div>
            </Layout>
        );
    }

    if (!opname) {
        return (
            <Layout>
                <div className="text-center py-20 text-gray-500">Data tidak ditemukan</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <HiClipboardList className="text-2xl text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Detail Opname #{opname.id}</h1>
                        <p className="text-gray-600">Informasi lengkap opname</p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-white shadow rounded p-5 mb-8">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>Cabang:</strong> {opname.branch_name}</div>
                        <div><strong>Tanggal:</strong> {formatDate(opname.date)}</div>
                        <div><strong>Dibuat oleh:</strong> {opname.created_by}</div>
                        <div><strong>Diverifikasi oleh:</strong> {opname.verified_by || "-"}</div>
                        <div><strong>Status:</strong> {opname.status}</div>
                        <div><strong>Selesai pada:</strong> {opname.completed_at ? formatDate(opname.completed_at) : "-"}</div>
                    </div>
                </div>

                {/* Detail Table */}
                <div className="bg-white shadow rounded overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Produk</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">System</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Fisik</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Selisih</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold">Catatan</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {opname.details.map((d) => (
                                <tr key={d.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{d.branch_inventory_id}</td>
                                    <td className="px-6 py-4">{d.system_qty}</td>
                                    <td className="px-6 py-4">{d.physical_qty}</td>
                                    <td className={`px-6 py-4 font-semibold ${d.difference < 0 ? "text-red-600" : "text-green-600"}`}>
                                        {d.difference}
                                    </td>
                                    <td className="px-6 py-4">{d.notes || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </Layout>
    );
};

export default OwnerOpnameDetail;
