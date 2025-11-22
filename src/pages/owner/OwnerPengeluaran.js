// src/pages/owner/OwnerPengeluaran.js
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { HiOutlineDocumentReport, HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ({
  Authorization: localStorage.getItem("authToken"),
  "ngrok-skip-browser-warning": "true",
});

const formatRupiah = (angka) => "Rp " + (angka || 0).toLocaleString("id-ID");

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

  // modal
  const [modal, setModal] = useState({ open: false, mode: "add", id: null });
  const [form, setForm] = useState({
    branch_id: 0,
    description: "",
    amount: 0,
  });

  const fetchBranches = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/branches`,
        { headers: getHeaders() }
      );
      setBranches(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setBranches([]);
    }
  };

  const fetchDetail = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", pageNumber);
      params.append("size", size);

      if (startDate && endDate) {
        const formatDate = (d) => {
          const dt = new Date(d);
          return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(dt.getDate()).padStart(2, "0")}`;
        };
        params.append("start_at", formatDate(startDate));
        params.append("end_at", formatDate(endDate));
      }
      if (branchFilter) params.append("branch_id", branchFilter);
      if (search) params.append("search", search);

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/expenses?${params.toString()}`,
        {
          headers: getHeaders(),
        }
      );

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
    setForm({ branch_id: 0, description: "", amount: 0 });
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
    setForm({ branch_id: 0, description: "", amount: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === "add") {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/expenses`,
          form,
          { headers: getHeaders() }
        );
      } else {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/expenses/${modal.id}`,
          form,
          { headers: getHeaders() }
        );
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
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/expenses/${id}`,
          { headers: getHeaders() }
        );
        fetchDetail(page);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Pagination sama persis OwnerAlurKas
  const Pagination = ({ page, setPage, totalPages, total, perPage }) => {
    const startIndex = total === 0 ? 0 : (page - 1) * perPage + 1;
    const endIndex = Math.min(page * perPage, total);

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Menampilkan {startIndex}-{endIndex} dari total {total} pengeluaran
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className={`px-2.5 py-1.5 rounded border ${
              page === 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            «
          </button>

          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded border ${
              page === 1
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Prev
          </button>

          <span className="text-sm text-gray-700">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1.5 rounded border ${
              page === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Next
          </button>

          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className={`px-2.5 py-1.5 rounded border ${
              page === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <HiOutlineDocumentReport className="text-4xl text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            Detail Pengeluaran
          </h1>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-wrap items-end gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
                setPage(1);
              }}
              isClearable
              maxDate={new Date()}
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih rentang tanggal"
              className="border rounded-md px-4 py-2 w-64 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabang
            </label>
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-4 py-2 w-64 text-base"
            >
              <option value="">Semua Cabang</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Deskripsi
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Masukkan kata kunci..."
              className="border rounded-md px-4 py-2 w-64 text-base"
            />
          </div>

          <button
            onClick={() => {
              setDateRange([null, null]);
              setBranchFilter("");
              setSearch("");
              setPage(1);
            }}
            className="px-5 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-base"
          >
            Reset
          </button>

          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-base"
          >
            <HiOutlinePlus className="w-6 h-6" /> Tambah
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                  Cabang
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-right text-xs uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : detailRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                detailRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </td>

                    <td className="px-6 py-4">
                      {branches.find((b) => b.id === row.branch_id)?.name ||
                        row.branch_name ||
                        "-"}
                    </td>

                    <td className="px-6 py-4">
                      {row.description || "-"}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      {formatRupiah(row.amount)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        >
                          <FiEdit size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

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
        </div>

        {/* Modal */}
        {modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {modal.mode === "add" ? "Tambah" : "Edit"} Pengeluaran
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cabang
                    </label>
                    <select
                      value={form.branch_id}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          branch_id: parseInt(e.target.value),
                        })
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Pilih Cabang</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deskripsi
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description: e.target.value,
                        })
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          amount: parseFloat(e.target.value),
                        })
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border rounded"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {modal.mode === "add" ? "Tambah" : "Simpan"}
                    </button>
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
