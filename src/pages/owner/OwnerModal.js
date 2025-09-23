// src/pages/owner/OwnerModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import { MdAccountBalanceWallet } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/capitals`;

// 📌 Pagination Component
const Pagination = ( { page, setPage, totalPages, total, perPage } ) => {
    const startIndex = ( page - 1 ) * perPage;
    const endIndex = Math.min( startIndex + perPage, total );

    return (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 mt-6">
            <div className="text-xs text-gray-500">
                Menampilkan { total === 0 ? 0 : startIndex + 1 }–{ endIndex } dari { total } data
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={ () => setPage( 1 ) }
                    disabled={ page === 1 }
                    className={ `px-2.5 py-1.5 rounded border ${page === 1
                        ? "text-gray-400 border-gray-200"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }` }
                >
                    «
                </button>
                <button
                    onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) }
                    disabled={ page === 1 }
                    className={ `px-3 py-1.5 rounded border ${page === 1
                        ? "text-gray-400 border-gray-200"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }` }
                >
                    Prev
                </button>
                <span className="text-sm text-gray-700">
                    { page } / { totalPages }
                </span>
                <button
                    onClick={ () => setPage( ( p ) => Math.min( totalPages, p + 1 ) ) }
                    disabled={ page === totalPages }
                    className={ `px-3 py-1.5 rounded border ${page === totalPages
                        ? "text-gray-400 border-gray-200"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }` }
                >
                    Next
                </button>
                <button
                    onClick={ () => setPage( totalPages ) }
                    disabled={ page === totalPages }
                    className={ `px-2.5 py-1.5 rounded border ${page === totalPages
                        ? "text-gray-400 border-gray-200"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }` }
                >
                    »
                </button>
            </div>
        </div>
    );
};

const OwnerModal = () => {
    const [ modals, setModals ] = useState( [] );
    const [ modal, setModal ] = useState( { open: false, mode: "add", idx: null } );
    const [ form, setForm ] = useState( {
        id: null,
        type: "OUT",
        note: "",
        amount: "",
        branch_id: 1,
    } );
    const [ loading, setLoading ] = useState( true );

    // Filter
    const [ searchNote, setSearchNote ] = useState( "" );
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    // Pagination
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const perPage = 10;

    useEffect( () => {
        fetchModals( currentPage );
    }, [ currentPage ] );

    const fetchModals = async ( page = 1 ) => {
        try {
            setLoading( true );
            const res = await axios.get( API_URL, {
                params: {
                    page,
                    size: perPage,
                    note: searchNote || undefined,
                },
                headers: {
                    Authorization: localStorage.getItem( "authToken" ),
                    "ngrok-skip-browser-warning": "true",
                },
            } );

            const { data, paging } = res.data;
            if ( Array.isArray( data ) ) {
                let filtered = data;

                // filter tanggal di frontend
                if ( startDate && endDate ) {
                    filtered = filtered.filter( ( m ) => {
                        const createdAt = new Date( m.created_at );
                        return createdAt >= startDate && createdAt <= endDate;
                    } );
                }

                setModals( filtered );
                setTotalPages( paging?.total_page || 1 );
                setTotalItems( paging?.total_item || 0 );
            } else {
                console.error( "Data modal tidak valid:", res.data );
            }
        } catch ( err ) {
            console.error( "Gagal fetch modal:", err );
        } finally {
            setLoading( false );
        }
    };

    const openAdd = () => {
        setForm( { id: null, type: "OUT", note: "", amount: "", branch_id: 1 } );
        setModal( { open: true, mode: "add", idx: null } );
    };

    const openEdit = ( idx ) => {
        setForm( modals[ idx ] );
        setModal( { open: true, mode: "edit", idx } );
    };

    const closeModal = () => setModal( { open: false, mode: "add", idx: null } );

    const handleSubmit = async ( e ) => {
        e.preventDefault();
        if ( !form.type || !form.note || !form.amount ) return;

        try {
            if ( modal.mode === "add" ) {
                await axios.post( API_URL, form, { headers: getHeaders() } );
            } else {
                await axios.put( `${API_URL}/${form.id}`, form, { headers: getHeaders() } );
            }
            fetchModals( currentPage );
            closeModal();
        } catch ( err ) {
            console.error( "Gagal menyimpan modal:", err );
        }
    };

    const handleDelete = async ( idx ) => {
        const id = modals[ idx ].id;
        if ( !id ) return;
        if ( window.confirm( "Yakin ingin menghapus modal ini?" ) ) {
            try {
                await axios.delete( `${API_URL}/${id}`, { headers: getHeaders() } );
                fetchModals( currentPage );
            } catch ( err ) {
                console.error( "Gagal menghapus modal:", err );
            }
        }
    };

    const handleFilter = () => {
        setCurrentPage( 1 );
        fetchModals( 1 );
    };

    const getHeaders = () => ( {
        Authorization: localStorage.getItem( "authToken" ),
        "ngrok-skip-browser-warning": "true",
    } );

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */ }
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <MdAccountBalanceWallet className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Data Modal</h1>
                            <p className="text-sm text-gray-600">
                                Kelola pemasukan dan pengeluaran modal
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={ openAdd }
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
                    >
                        <HiOutlinePlus className="text-lg" /> Tambah Modal
                    </button>
                </div>

                {/* Filter */ }
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Cari catatan..."
                        value={ searchNote }
                        onChange={ ( e ) => setSearchNote( e.target.value ) }
                        className="border px-3 py-2 rounded-lg w-full md:w-1/3"
                    />
                    <DatePicker
                        selectsRange
                        startDate={ startDate }
                        endDate={ endDate }
                        onChange={ ( update ) => setDateRange( update ) }
                        isClearable
                        dateFormat="dd/MM/yyyy"
                        className="border border-gray-300 px-4 py-2 rounded-lg text-sm w-full"
                        placeholderText="Pilih rentang tanggal"
                    />
                    <button
                        onClick={ handleFilter }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Cari
                    </button>
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                                        Jenis
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                                        Catatan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                                        Jumlah
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 5 } className="text-center py-8">
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : modals.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 5 } className="text-center py-8">
                                            Tidak ada data
                                        </td>
                                    </tr>
                                ) : (
                                    modals.map( ( m, idx ) => (
                                        <tr key={ m.id }>
                                            <td className="px-6 py-3 font-medium">
                                                { m.type === "IN" ? (
                                                    <span className="text-green-600">Deposit</span>
                                                ) : (
                                                    <span className="text-red-600">Withdraw</span>
                                                ) }
                                            </td>
                                            <td className="px-6 py-3 text-gray-700">{ m.note }</td>
                                            <td className="px-6 py-3 text-gray-900 font-semibold">
                                                Rp { m.amount.toLocaleString( "id-ID" ) }
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 text-sm">
                                                { new Date( m.created_at ).toLocaleDateString( "id-ID" ) }
                                            </td>
                                            <td className="px-6 py-3 flex justify-end gap-2">
                                                <button
                                                    onClick={ () => openEdit( idx ) }
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <FiEdit size={ 18 } />
                                                </button>
                                                <button
                                                    onClick={ () => handleDelete( idx ) }
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                    title="Hapus"
                                                >
                                                    <FiTrash size={ 18 } />
                                                </button>
                                            </td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */ }
                { totalPages > 1 && (
                    <Pagination
                        page={ currentPage }
                        setPage={ setCurrentPage }
                        totalPages={ totalPages }
                        total={ totalItems }
                        perPage={ perPage }
                    />
                ) }

                {/* Modal Form */ }
                { modal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    { modal.mode === "add" ? "Tambah" : "Edit" } Modal
                                </h2>
                                <form onSubmit={ handleSubmit } className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">
                                            Jenis
                                        </label>
                                        <select
                                            value={ form.type }
                                            onChange={ ( e ) =>
                                                setForm( { ...form, type: e.target.value } )
                                            }
                                            className="w-full border px-3 py-2 rounded-lg"
                                            required
                                        >
                                            <option value="IN">Deposit</option>
                                            <option value="OUT">Withdraw</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">
                                            Catatan
                                        </label>
                                        <input
                                            type="text"
                                            value={ form.note }
                                            onChange={ ( e ) =>
                                                setForm( { ...form, note: e.target.value } )
                                            }
                                            className="w-full border px-3 py-2 rounded-lg"
                                            placeholder="Masukkan catatan modal"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">
                                            Jumlah (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            value={ form.amount }
                                            onChange={ ( e ) =>
                                                setForm( { ...form, amount: Number( e.target.value ) } )
                                            }
                                            className="w-full border px-3 py-2 rounded-lg"
                                            placeholder="Masukkan jumlah"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-3 border-t">
                                        <button
                                            type="button"
                                            onClick={ closeModal }
                                            className="px-4 py-2 border rounded-lg"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                ) }
            </div>
        </Layout>
    );
};

export default OwnerModal;
