import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { HiOutlineDocumentReport, HiOutlinePlus } from "react-icons/hi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ({
  Authorization: localStorage.getItem("authToken"),
  "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) =>
  "Rp " + (angka || 0).toLocaleString("id-ID");

const OwnerPengeluaran = () => {
  const [branches, setBranches] = useState([]);
  const [detailRows, setDetailRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination & filter
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [branchFilter, setBranchFilter] = useState("");
  const [search, setSearch] = useState("");

  // modal tambah/edit
  const [modal, setModal] = useState({ open: false, mode: "add", id: null });
  const [form, setForm] = useState({ branch_id: "", description: "", amount: "" });

  // fetch daftar cabang
  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/branches`, {
        headers: getHeaders(),
      });
      setBranches(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setBranches([]);
    }
  };

  // fetch detail pengeluaran
  const fetchDetail = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNumber);
      params.append("size", size);
      if (startDate && endDate) {
        const formatDate = (d) => {
          const dt = new Date(d);
          return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        };
        params.append("start_at", formatDate(startDate));
        params.append("end_at", formatDate(endDate));
      }
      if (branchFilter) params.append("branch_id", branchFilter);
      if (search) params.append("search", search);

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/expenses?${params.toString()}`, {
        headers: getHeaders(),
      });

      const payload = res.data || {};
      setDetailRows(Array.isArray(payload.data) ? payload.data : []);
      setTotalPage(payload.paging?.total_page || 1);
      setTotalItems(payload.paging?.total_item || 0);
    } catch (err) {
      console.error(err);
      setDetailRows([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchDetail(page);
  }, [page, branchFilter, startDate, endDate, search]);

  const openAdd = () => {
    setForm({ branch_id: "", description: "", amount: "" });
    setModal({ open: true, mode: "add", id: null });
  };

  const openEdit = (row) => {
    setForm({
      branch_id: row.branch_id,
      description: row.description,
      amount: row.amount,
    });
    setModal({ open: true, mode: "edit", id: row.id });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "add", id: null });
    setForm({ branch_id: "", description: "", amount: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === "add") {
        await axios.post(`${process.env.REACT_APP_API_URL}/expenses`, form, { headers: getHeaders() });
      } else {
        await axios.put(`${process.env.REACT_APP_API_URL}/expenses/${modal.id}`, form, { headers: getHeaders() });
      }
      fetchDetail(page);
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm("Yakin ingin menghapus pengeluaran ini?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/expenses/${id}`, { headers: getHeaders() });
        fetchDetail(page);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const Pagination = ({ page, setPage, totalPages, total, perPage }) => {
    const startIndex = (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Menampilkan {total === 0 ? 0 : startIndex}-{endIndex} dari total {total} pengeluaran
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2.5 py-1.5 rounded border text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200">«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200">Prev</button>
          <span className="text-sm text-gray-700">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200">Next</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2.5 py-1.5 rounded border text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200">»</button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <HiOutlineDocumentReport className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Detail Pengeluaran</h1>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => { setDateRange(update); setPage(1); }}
              isClearable
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih rentang tanggal"
              className="border rounded-md px-2 py-1 text-sm w-56"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
            <select
              value={branchFilter}
              onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              className="border rounded-md px-2 py-1 text-sm w-56"
            >
              <option value="">Semua Cabang</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Deskripsi</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Masukkan kata kunci..."
              className="border rounded-md px-2 py-1 text-sm w-56"
            />
          </div>

          {/* Tombol Reset */}
          <button
            onClick={() => { setDateRange([null, null]); setBranchFilter(""); setSearch(""); setPage(1); }}
            className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
          >
            Reset
          </button>

          {/* Tombol Tambah */}
          <button
            onClick={openAdd}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            <HiOutlinePlus className="w-4 h-4" /> Tambah
          </button>
        </div>

        {/* Tabel Detail */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cabang</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Deskripsi</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">Memuat data...</td>
                </tr>
              ) : detailRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <div className="p-4 bg-gray-100 rounded-full mb-3">
                        <HiOutlineDocumentReport className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-700 mb-1">
                        Tidak Ada Data Pengeluaran
                      </h3>
                    </div>
                  </td>
                </tr>
              ) : (
                detailRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="px-6 py-4">{branches.find(b => b.id === row.branch_id)?.name || row.branch_name || "-"}</td>
                    <td className="px-6 py-4">{row.description || "-"}</td>
                    <td className="px-6 py-4 text-right font-semibold">{formatRupiah(row.amount)}</td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button onClick={() => openEdit(row)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Edit</button>
                      <button onClick={() => handleDelete(row.id)} className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPage > 1 && (
          <Pagination
            page={page}
            setPage={setPage}
            totalPages={totalPage}
            total={totalItems}
            perPage={size}
          />
        )}

        {/* Modal Tambah/Edit */}
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {modal.mode === "add" ? "Tambah Pengeluaran" : "Edit Pengeluaran"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
                    <select
                      value={form.branch_id}
                      onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Pilih Cabang</option>
                      {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Masukkan deskripsi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Masukkan jumlah"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button type="button" onClick={closeModal} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Batal</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{modal.mode === "add" ? "Tambah" : "Simpan"}</button>
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

export default OwnerPengeluaran;
