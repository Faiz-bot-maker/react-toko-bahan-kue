import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { HiOutlineDocumentReport, HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';

const getHeaders = () => ({
  Authorization: localStorage.getItem('authToken'),
  'ngrok-skip-browser-warning': 'true',
});

const formatRupiah = (angka) => 'Rp ' + (angka || 0).toLocaleString('id-ID');

const OwnerLaporanPengeluaran = () => {
  // Ringkasan
  const [summaryRows, setSummaryRows] = useState([]);
  const [totalAll, setTotalAll] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Detail
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [period, setPeriod] = useState('');
  const [report, setReport] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // CRUD Transaksi
  const [expenses, setExpenses] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState({ branch_id: '', date: '', category: '', amount: '' });
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const periodRef = useRef(null);

  useEffect(() => {
    fetchSummary();
    fetchBranches();
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (isPeriodOpen && periodRef.current && !periodRef.current.contains(e.target)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isPeriodOpen]);

  const parsePeriod = (value) => {
    if (!value) return { start: '', end: '' };
    const parts = value.split(/\s*(?:-|to|s\/d|s\.d)\s*/i);
    const start = (parts[0] || '').trim();
    const end = (parts[1] || '').trim();
    return { start, end };
  };

  const fetchSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/expenses`, { headers: getHeaders() });
      const payload = res.data?.data ? res.data : res.data;
      const rows = payload.data || [];
      setSummaryRows(Array.isArray(rows) ? rows : []);
      setTotalAll(payload.total_all_branches || 0);
    } catch (err) {
      console.error('Gagal mengambil ringkasan pengeluaran:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/branches`, { headers: getHeaders() });
      const rows = res.data?.data || res.data || [];
      setBranches(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error('Gagal memuat cabang:', err);
    }
  };

  const fetchDetail = async () => {
    const { start, end } = parsePeriod(period);
    if (!branchId || !start || !end) return;
    try {
      setLoadingDetail(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/expenses/detail`, {
        headers: getHeaders(),
        params: { branch_id: branchId, start_date: start, end_date: end },
      });
      const payload = res.data || {};
      setReport(payload);
    } catch (err) {
      console.error('Gagal mengambil detail pengeluaran:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoadingList(true);
      const { start, end } = parsePeriod(period);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/expenses`, {
        headers: getHeaders(),
        params: {
          branch_id: branchId || undefined,
          start_date: start || undefined,
          end_date: end || undefined,
          list: true,
        },
      });
      const rows = res.data?.data || res.data || [];
      setExpenses(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error('Gagal mengambil data pengeluaran:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const handleView = async () => {
    await Promise.all([fetchDetail(), fetchExpenses()]);
  };

  const openPeriodPicker = () => {
    const { start, end } = parsePeriod(period);
    setPeriodStart(start || '');
    setPeriodEnd(end || '');
    setIsPeriodOpen(true);
  };

  const applyPeriod = () => {
    if (periodStart && periodEnd) {
      setPeriod(`${periodStart} - ${periodEnd}`);
    } else {
      setPeriod('');
    }
    setIsPeriodOpen(false);
  };

  const resetPeriod = () => {
    setPeriodStart('');
    setPeriodEnd('');
    setPeriod('');
  };

  const openAdd = () => {
    setModal({ open: true, mode: 'add', data: null });
    setForm({ branch_id: branchId || '', date: '', category: '', amount: '' });
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
        await axios.post(`${process.env.REACT_APP_API_URL}/expenses`, payload, { headers: getHeaders() });
      } else {
        const id = modal.data.id;
        await axios.put(`${process.env.REACT_APP_API_URL}/expenses/${id}`, payload, { headers: getHeaders() });
      }

      closeModal();
      await Promise.all([fetchExpenses(), fetchDetail(), fetchSummary()]);
    } catch (err) {
      console.error('Gagal menyimpan pengeluaran:', err);
      alert('Gagal menyimpan pengeluaran.');
    }
  };

  const handleDelete = async (exp) => {
    if (!window.confirm('Yakin ingin menghapus pengeluaran ini?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/expenses/${exp.id}`, { headers: getHeaders() });
      await Promise.all([fetchExpenses(), fetchDetail(), fetchSummary()]);
    } catch (err) {
      console.error('Gagal menghapus pengeluaran:', err);
      alert('Gagal menghapus pengeluaran.');
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <HiOutlineDocumentReport className="text-2xl text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Laporan Pengeluaran</h1>
              <p className="text-sm text-gray-600">Ringkasan semua cabang dan detail per cabang</p>
            </div>
          </div>
        </div>

        {/* Filter dan Tabel Detail per Cabang (dipindah ke atas) */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Detail per Cabang</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select className="border rounded px-3 py-2" value={branchId} onChange={e => setBranchId(e.target.value)}>
              <option value="">Pilih Cabang</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <div className="relative" ref={periodRef}>
              <input
                type="text"
                readOnly
                onClick={openPeriodPicker}
                className="w-full border rounded px-3 py-2 cursor-pointer bg-white"
                placeholder="Pilih Periode (kalender)"
                value={period || ''}
              />
              {isPeriodOpen && (
                <div className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tanggal Mulai</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tanggal Selesai</label>
                      <input type="date" className="w-full border rounded px-3 py-2" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={resetPeriod} className="px-3 py-1.5 border rounded">Reset</button>
                      <button type="button" onClick={applyPeriod} className="px-3 py-1.5 bg-red-600 text-white rounded">Terapkan</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleView} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Tampilkan
            </button>
          </div>
        </div>

        {loadingDetail ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Memuat data...</span>
          </div>
        ) : report ? (
          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="text-sm text-gray-500">Cabang</div>
                  <div className="text-base font-semibold text-gray-800">{report.branch_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Periode</div>
                  <div className="text-base font-semibold text-gray-800">{report.period}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Pengeluaran</div>
                  <div className="text-lg font-bold text-red-600">{formatRupiah(report.total_expenses)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(report.expenses || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-800">{row.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-800">{formatRupiah(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mb-8">Silakan pilih cabang dan periode, lalu klik Tampilkan</div>
        )}

        {/* KPI / Ringkasan Aggregate
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Total Semua Cabang</p>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalAll)}</div>
          </div>
        </div> */}

        {/* Tabel Ringkasan per Cabang */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 pt-4">
            <h2 className="text-base font-semibold text-gray-800 mb-2">Ringkasan per Cabang</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Cabang</th>
                  <th className="px-6 pl-4 text-left font-semibold text-xs uppercase tracking-wider text-end pr-5">Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingSummary ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : summaryRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-gray-500">Belum ada data pengeluaran</td>
                  </tr>
                ) : (
                  summaryRows.map((row, idx) => (
                    <tr key={row.branch_id || idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{row.branch_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 ">{formatRupiah(row.total_expenses)}</td>
                    </tr>
                  ))
                )}
            </tbody>
            <thead className="bg-gradient-to-r from-gray-200 to-gray-300 text-black">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">total :</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">{formatRupiah(totalAll)}</th>
                </tr>
              </thead>
          </table>
        </div>
      </div>

      {/* Tabel Transaksi Pengeluaran (CRUD) */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden mt-8">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">Transaksi Pengeluaran</h2>
          <button onClick={openAdd} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">
            <HiOutlinePlus className="text-lg" /> Tambah Pengeluaran
          </button>
        </div>
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
              {loadingList ? (
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
    </Layout >
  );
};

export default OwnerLaporanPengeluaran; 