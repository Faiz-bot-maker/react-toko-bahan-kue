import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';

const API_EXPENSES = `${process.env.REACT_APP_API_URL}/expenses`;
const API_BRANCHES = `${process.env.REACT_APP_API_URL}/branches`;

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + (Number(angka) || 0).toLocaleString('id-ID');

const Pengeluaran = () => {
  const [branches, setBranches] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [branchId, setBranchId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState({ branch_id: '', date: '', category: '', amount: '' });

  useEffect(() => {
    fetchBranches();
    fetchExpenses();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(API_BRANCHES, { headers: getHeaders() });
      const rows = res.data?.data || res.data || [];
      setBranches(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error('Gagal memuat cabang:', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_EXPENSES, {
        headers: getHeaders(),
        params: {
          branch_id: branchId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          list: true,
        },
      });
      const rows = res.data?.data || res.data || [];
      setExpenses(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error('Gagal mengambil data pengeluaran:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setModal({ open: true, mode: 'add', data: null });
    setForm({ branch_id: '', date: '', category: '', amount: '' });
  };

  const openEdit = (exp) => {
    setModal({ open: true, mode: 'edit', data: exp });
    setForm({
      branch_id: exp.branch_id || exp.branch?.id || '',
      date: exp.date ? exp.date.substring(0, 10) : '',
      category: exp.category || '',
      amount: exp.amount || '',
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: 'add', data: null });
    setForm({ branch_id: '', date: '', category: '', amount: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        branch_id: Number(form.branch_id),
        date: form.date,
        category: form.category,
        amount: Number(form.amount) || 0,
      };

      if (modal.mode === 'add') {
        await axios.post(API_EXPENSES, payload, { headers: getHeaders() });
      } else {
        const id = modal.data.id;
        await axios.put(`${API_EXPENSES}/${id}`, payload, { headers: getHeaders() });
      }

      closeModal();
      fetchExpenses();
    } catch (err) {
      console.error('Gagal menyimpan pengeluaran:', err);
      alert('Gagal menyimpan pengeluaran.');
    }
  };

  const handleDelete = async (exp) => {
    if (!window.confirm('Yakin ingin menghapus pengeluaran ini?')) return;
    try {
      await axios.delete(`${API_EXPENSES}/${exp.id}`, { headers: getHeaders() });
      fetchExpenses();
    } catch (err) {
      console.error('Gagal menghapus pengeluaran:', err);
      alert('Gagal menghapus pengeluaran.');
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Pengeluaran</h1>
            <p className="text-sm text-gray-600">Kelola data pengeluaran per cabang</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl">
            <HiOutlinePlus className="text-lg" /> Tambah Pengeluaran
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select className="border rounded px-3 py-2" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              <option value="">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <input type="date" className="border rounded px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" className="border rounded px-3 py-2" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button onClick={fetchExpenses} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Terapkan</button>
            <button onClick={() => { setBranchId(''); setStartDate(''); setEndDate(''); }} className="border px-4 py-2 rounded">Reset</button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Cabang</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Jumlah</th>
                  <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td>
                  </tr>
                ) : (
                  expenses.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{row.date ? new Date(row.date).toLocaleDateString('id-ID') : '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{row.branch_name || row.branch?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{row.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{formatRupiah(row.amount)}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEdit(row)} className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors mr-2" title="Edit">
                          <FiEdit size={18} />
                        </button>
                        <button onClick={() => handleDelete(row)} className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <FiTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{modal.mode === 'add' ? 'Tambah' : 'Edit'} Pengeluaran</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cabang</label>
                    <select
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                      value={form.branch_id}
                      onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                      required
                    >
                      <option value="">Pilih Cabang</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                      placeholder="Contoh: Gaji Harian, Transport"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-colors"
                      placeholder="0"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={closeModal} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">Batal</button>
                    <button type="submit" className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Pengeluaran; 