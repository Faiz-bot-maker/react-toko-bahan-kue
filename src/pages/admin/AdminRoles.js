import React, { useState, useEffect } from 'react';
import { HiOutlineShieldCheck, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import axios from 'axios';
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/roles`;

const getHeaders = () => ({
    Authorization: localStorage.getItem('authToken'),
    'ngrok-skip-browser-warning': 'true',
});

const AdminRoles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });

    const availablePermissions = [
        { id: 'products', name: 'Kelola Produk' },
        { id: 'categories', name: 'Kelola Kategori' },
        { id: 'users', name: 'Kelola User' },
        { id: 'roles', name: 'Kelola Role' },
        { id: 'branches', name: 'Kelola Cabang' },
        { id: 'distributors', name: 'Kelola Distributor' },
        { id: 'reports', name: 'Lihat Laporan' },
        { id: 'finance', name: 'Kelola Keuangan' },
        { id: 'orders', name: 'Kelola Pesanan' },
        { id: 'inventory', name: 'Kelola Inventori' }
    ];

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL, { headers: getHeaders() });
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) setRoles(data);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await axios.put(`${API_URL}/${editingRole.id}`, formData, { headers: getHeaders() });
            } else {
                await axios.post(API_URL, formData, { headers: getHeaders() });
            }
            setShowModal(false);
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: [] });
            fetchRoles();
        } catch (err) {
            console.error('Failed to save role:', err);
        }
    };

    const handleEdit = (role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions || []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            try {
                await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
                fetchRoles();
            } catch (err) {
                console.error('Failed to delete role:', err);
            }
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(id => id !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const getPermissionNames = (permissionIds) => {
        return permissionIds.map(id => {
            const permission = availablePermissions.find(p => p.id === id);
            return permission ? permission.name : id;
        });
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <HiOutlineShieldCheck className="text-2xl text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Daftar Role</h1>
                            <p className="text-sm text-gray-600">Kelola role dan permission pengguna</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <HiOutlinePlus className="text-sm" />
                        Tambah Role
                    </button>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Nama Role</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Deskripsi</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Permissions</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Jumlah User</th>
                                    <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : roles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineShieldCheck className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada role</h3>
                                                <p className="text-gray-500 mb-4 text-sm">Role belum tersedia di sistem</p>
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                >
                                                    Tambah Role Pertama
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                                        <HiOutlineShieldCheck className="text-indigo-600 text-sm" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {role.description || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(role.permissions || []).slice(0, 3).map((permission) => (
                                                        <span key={permission} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                                            {permission}
                                                        </span>
                                                    ))}
                                                    {(role.permissions || []).length > 3 && (
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                            +{(role.permissions || []).length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {role.users_count || 0} user
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(role)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <HiOutlinePencil className="text-sm" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(role.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <HiOutlineTrash className="text-sm" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                            <h2 className="text-xl font-bold mb-4">
                                {editingRole ? 'Edit Role' : 'Tambah Role'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Role
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        rows="3"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permissions
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                        {availablePermissions.map((permission) => (
                                            <label key={permission.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(permission.id)}
                                                    onChange={() => handlePermissionToggle(permission.id)}
                                                    className="mr-2"
                                                />
                                                <span className="text-sm text-gray-700">{permission.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingRole(null);
                                            setFormData({ name: '', description: '', permissions: [] });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        {editingRole ? 'Update' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminRoles;

