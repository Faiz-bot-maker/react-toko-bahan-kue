import React, { useState, useEffect } from "react";
import axios from "axios";
import { HiOutlinePlus } from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import { MdAccountBalanceWallet } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/capitals`;

const AdminModal = () => {
    const [ modals, setModals ] = useState( [] );
    const [ modal, setModal ] = useState( { open: false, mode: "add", idx: null } );
    const [ form, setForm ] = useState( { id: null, type: "OUT", note: "", amount: "" } );
    const [ loading, setLoading ] = useState( true );

    // Filter tanggal
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    // Search dengan debounce
    const [ search, setSearch ] = useState( "" );
    const [ debouncedSearch, setDebouncedSearch ] = useState( "" );
    useEffect( () => {
        const handler = setTimeout( () => setDebouncedSearch( search ), 500 );
        return () => clearTimeout( handler );
    }, [ search ] );

    // Pagination
    const [ page, setPage ] = useState( 1 );
    const [ size ] = useState( 10 );
    const [ totalPage, setTotalPage ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

    useEffect( () => {
        fetchModals( page );
    }, [ endDate, debouncedSearch, page ] );

    // Fungsi helper untuk format tanggal lokal (hindari masalah timezone)
    const formatLocalDate = ( date ) => {
        const year = date.getFullYear();
        const month = String( date.getMonth() + 1 ).padStart( 2, "0" );
        const day = String( date.getDate() ).padStart( 2, "0" );
        return `${year}-${month}-${day}`;
    };

    const fetchModals = async ( targetPage = 1 ) => {
        try {
            setLoading( true );
            let params = { page: targetPage, size };
            if ( startDate ) params.start_at = formatLocalDate( startDate );
            if ( endDate ) params.end_at = formatLocalDate( endDate );
            if ( debouncedSearch ) params.search = debouncedSearch;

            const res = await axios.get( API_URL, {
                headers: { Authorization: localStorage.getItem( "authToken" ), "ngrok-skip-browser-warning": "true" },
                params,
            } );

            setModals( res.data?.data || [] );
            if ( res.data?.paging ) {
                setTotalPage( res.data.paging.total_page );
                setTotalItems( res.data.paging.total_item );
            }
        } catch ( err ) {
            console.error( "Gagal fetch modal:", err );
            setModals( [] );
        } finally {
            setLoading( false );
        }
    };

    const openAdd = () => {
        setForm( { id: null, type: "OUT", note: "", amount: "" } );
        setModal( { open: true, mode: "add", idx: null } );
    };

    const openEdit = ( idx ) => {
        setForm( { ...modals[ idx ] } );
        setModal( { open: true, mode: "edit", idx } );
    };

    const closeModal = () => setModal( { open: false, mode: "add", idx: null } );

    const handleSubmit = async ( e ) => {
        e.preventDefault();
        if ( !form.type || !form.note || !form.amount ) return;

        try {
            if ( modal.mode === "add" ) {
                await axios.post( API_URL, { ...form, amount: Number( form.amount ) }, {
                    headers: { Authorization: localStorage.getItem( "authToken" ), "ngrok-skip-browser-warning": "true" }
                } );
                alert( "Modal berhasil ditambahkan" );
            } else if ( form.id ) {
                await axios.put( `${API_URL}/${form.id}`, { ...form, amount: Number( form.amount ) }, {
                    headers: { Authorization: localStorage.getItem( "authToken" ), "ngrok-skip-browser-warning": "true" }
                } );
                alert( "Modal berhasil diperbarui" );
            }
            fetchModals( page );
            closeModal();
        } catch ( err ) {
            console.error( "Gagal menyimpan modal:", err );
            alert( "Terjadi kesalahan saat menyimpan modal" );
        }
    };

    const handleDelete = async ( idx ) => {
        const id = modals[ idx ]?.id;
        if ( !id ) return;
        if ( window.confirm( "Yakin ingin menghapus modal ini?" ) ) {
            try {
                await axios.delete( `${API_URL}/${id}`, {
                    headers: { Authorization: localStorage.getItem( "authToken" ), "ngrok-skip-browser-warning": "true" }
                } );
                alert( "Modal berhasil dihapus" );
                fetchModals( page );
            } catch ( err ) {
                console.error( "Gagal menghapus modal:", err );
                alert( "Gagal menghapus modal" );
            }
        }
    };

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
                            <h1 className="text-2xl font-bold text-gray-800">Data Modal Cabang</h1>
                            <p className="text-sm text-gray-600">Kelola modal untuk cabang ini</p>
                        </div>
                    </div>
                    <button onClick={ openAdd } className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl">
                        <HiOutlinePlus className="text-lg" /> Tambah Modal
                    </button>
                </div>

                {/* Filter Tanggal + Search */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    <input
                        type="text"
                        placeholder="Cari catatan..."
                        value={ search }
                        onChange={ ( e ) => { setSearch( e.target.value ); setPage( 1 ); } }
                        className="border rounded px-3 py-2 text-sm w-64"
                    />
                    <DatePicker
                        selectsRange
                        startDate={ startDate }
                        endDate={ endDate }
                        onChange={ ( range ) => { setDateRange( range ); setPage( 1 ); } }
                        isClearable
                        dateFormat="dd/MM/yyyy"
                        className="border rounded px-3 py-2 text-sm w-60"
                        placeholderText="Pilih rentang tanggal"
                    />
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Jenis</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Catatan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Jumlah</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Tanggal</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr><td colSpan={ 5 } className="text-center py-8">Memuat data...</td></tr>
                                ) : modals.length === 0 ? (
                                    <tr><td colSpan={ 5 } className="text-center py-8">Tidak ada data untuk tanggal yang dipilih</td></tr>
                                ) : (
                                    modals.map( ( m, idx ) => (
                                        <tr key={ m.id }>
                                            <td className="px-6 py-3 font-medium">{ m.type === "IN" ? <span className="text-green-600">Deposit</span> : <span className="text-red-600">Withdraw</span> }</td>
                                            <td className="px-6 py-3 text-gray-700">{ m.note }</td>
                                            <td className="px-6 py-3 text-gray-900 font-semibold">Rp { Number( m.amount ).toLocaleString( "id-ID" ) }</td>
                                            <td className="px-6 py-3 text-gray-600 text-sm">{ new Date( m.created_at ).toLocaleDateString( "id-ID" ) }</td>
                                            <td className="px-6 py-3 flex justify-end gap-2">
                                                <button onClick={ () => openEdit( idx ) } className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg" title="Edit"><FiEdit size={ 18 } /></button>
                                                <button onClick={ () => handleDelete( idx ) } className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg" title="Hapus"><FiTrash size={ 18 } /></button>
                                            </td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */ }
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                            Menampilkan { ( page - 1 ) * size + 1 }–{ Math.min( page * size, totalItems ) } dari { totalItems } data
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={ () => setPage( 1 ) } disabled={ page === 1 } className={ `px-2.5 py-1.5 rounded border ${page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>«</button>
                            <button onClick={ () => setPage( p => Math.max( 1, p - 1 ) ) } disabled={ page === 1 } className={ `px-3 py-1.5 rounded border ${page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>Prev</button>
                            <span className="text-sm text-gray-700">{ page } / { totalPage }</span>
                            <button onClick={ () => setPage( p => Math.min( totalPage, p + 1 ) ) } disabled={ page === totalPage || totalPage === 0 } className={ `px-3 py-1.5 rounded border ${page === totalPage || totalPage === 0 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>Next</button>
                            <button onClick={ () => setPage( totalPage ) } disabled={ page === totalPage || totalPage === 0 } className={ `px-2.5 py-1.5 rounded border ${page === totalPage || totalPage === 0 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>»</button>
                        </div>
                    </div>
                </div>

                {/* Modal Form */ }
                { modal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4">{ modal.mode === "add" ? "Tambah" : "Edit" } Modal</h2>
                                <form onSubmit={ handleSubmit } className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Jenis</label>
                                        <select value={ form.type } onChange={ ( e ) => setForm( { ...form, type: e.target.value } ) } className="w-full border px-3 py-2 rounded-lg" required>
                                            <option value="IN">Deposit</option>
                                            <option value="OUT">Withdraw</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Catatan</label>
                                        <input type="text" value={ form.note } onChange={ ( e ) => setForm( { ...form, note: e.target.value } ) } className="w-full border px-3 py-2 rounded-lg" placeholder="Masukkan catatan modal" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">Jumlah (Rp)</label>
                                        <input type="number" value={ form.amount } onChange={ ( e ) => setForm( { ...form, amount: Number( e.target.value ) } ) } className="w-full border px-3 py-2 rounded-lg" placeholder="Masukkan jumlah" required />
                                    </div>
                                    <div className="flex justify-end gap-3 pt-3 border-t">
                                        <button type="button" onClick={ closeModal } className="px-4 py-2 border rounded-lg">Batal</button>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Simpan</button>
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

export default AdminModal;
