// src/pages/admin/AdminPergerakanStok.js
import React, { useState, useEffect } from "react";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = `${process.env.REACT_APP_API_URL}/inventory-movement`;

const getHeaders = () => ( {
    Authorization: localStorage.getItem( "authToken" ),
    "ngrok-skip-browser-warning": "true",
} );

// Format tanggal lokal tanpa mundur 1 hari
const formatLocalDate = ( date ) => {
    if ( !date ) return null;
    const d = new Date( date );
    d.setMinutes( d.getMinutes() - d.getTimezoneOffset() );
    return d.toISOString().split( "T" )[ 0 ];
};

const AdminPergerakanStok = () => {
    const [ movements, setMovements ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    const [ page, setPage ] = useState( 1 );
    const [ size ] = useState( 10 );
    const [ totalPage, setTotalPage ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

    const [ search, setSearch ] = useState( "" );

    const adminBranchId = localStorage.getItem( "branch_id" );

    const fetchMovements = async ( targetPage = page ) => {
        try {
            setLoading( true );

            const params = {
                branch_id: adminBranchId,
                page: targetPage,
                size,
            };
            if ( search ) params.search = search;
            if ( startDate ) params.start_at = formatLocalDate( startDate );
            if ( endDate ) params.end_at = formatLocalDate( endDate );

            const res = await axios.get( API_URL, { headers: getHeaders(), params } );

            setMovements( res.data?.data || [] );
            if ( res.data?.paging ) {
                setTotalPage( res.data.paging.total_page );
                setTotalItems( res.data.paging.total_item );

                if ( targetPage > res.data.paging.total_page ) setPage( 1 );
            } else {
                setTotalPage( 1 );
                setTotalItems( res.data?.data?.length || 0 );
            }
        } catch ( err ) {
            console.error( "Failed to fetch inventory movements:", err );
            setMovements( [] );
            setTotalPage( 1 );
            setTotalItems( 0 );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchMovements();
    }, [ page, search, startDate, endDate ] ); // eslint-disable-line react-hooks/exhaustive-deps

    const formatDate = ( timestamp ) => {
        const d = new Date( timestamp );
        return d.toLocaleDateString( "id-ID", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        } );
    };

    const resetFilters = () => {
        setDateRange( [ null, null ] );
        setSearch( "" );
        setPage( 1 );
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */ }
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <HiOutlineSwitchHorizontal className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Pergerakan Stok</h1>
                            <p className="text-sm text-gray-600">Catatan perubahan stok barang cabang Anda</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tanggal & Search */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal</label>
                        <DatePicker
                            selectsRange
                            startDate={ startDate }
                            endDate={ endDate }
                            onChange={ ( update ) => setDateRange( update ) }
                            isClearable
                            dateFormat="dd/MM/yyyy"
                            className="border rounded px-3 py-2 text-sm w-60"
                            placeholderText="Pilih rentang tanggal"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari Produk / Referensi</label>
                        <input
                            type="text"
                            placeholder="Masukkan nama produk atau referensi..."
                            value={ search }
                            onChange={ ( e ) => { setSearch( e.target.value ); setPage( 1 ); } }
                            className="border rounded px-3 py-2 text-sm w-80"
                        />
                    </div>
                    <div>
                        <button onClick={ resetFilters } className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm">
                            Reset
                        </button>
                    </div>
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Produk</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Ukuran</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Referensi</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Perubahan</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 6 } className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : movements.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 6 } className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineSwitchHorizontal className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Data tidak ada</h3>
                                                {/* <p className="text-gray-500 text-sm">Tidak ditemukan pergerakan stok sesuai filter</p> */}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    movements.map( ( mv, index ) => (
                                        <tr key={ mv.id } className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium text-gray-900">{ ( page - 1 ) * size + index + 1 }</td>
                                            <td className="px-6 py-3 text-gray-700">{ mv.product_name }</td>
                                            <td className="px-6 py-3 text-gray-700">{ mv.size_label }</td>
                                            <td className="px-6 py-3 text-gray-700">{ mv.reference_type } ({ mv.reference_key })</td>
                                            <td className={ `px-6 py-3 font-semibold ${mv.change_qty > 0 ? "text-green-600" : "text-red-600"}` }>
                                                { mv.change_qty > 0 ? `+${mv.change_qty}` : mv.change_qty }
                                            </td>
                                            <td className="px-6 py-3 text-gray-700">{ formatDate( mv.created_at ) }</td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */ }
                    { movements.length > 0 && totalItems > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                Menampilkan { ( page - 1 ) * size + 1 }–{ Math.min( page * size, totalItems ) } dari { totalItems } data
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={ () => setPage( 1 ) }
                                    disabled={ page <= 1 }
                                    className={ `px-2.5 py-1.5 rounded border ${page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
                                >
                                    «
                                </button>
                                <button
                                    onClick={ () => setPage( p => Math.max( 1, p - 1 ) ) }
                                    disabled={ page <= 1 }
                                    className={ `px-3 py-1.5 rounded border ${page <= 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
                                >
                                    Prev
                                </button>
                                <span className="text-sm text-gray-700">{ page } / { totalPage }</span>
                                <button
                                    onClick={ () => setPage( p => Math.min( totalPage, p + 1 ) ) }
                                    disabled={ page >= totalPage }
                                    className={ `px-3 py-1.5 rounded border ${page >= totalPage ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
                                >
                                    Next
                                </button>
                                <button
                                    onClick={ () => setPage( totalPage ) }
                                    disabled={ page >= totalPage }
                                    className={ `px-2.5 py-1.5 rounded border ${page >= totalPage ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </Layout>
    );
};

export default AdminPergerakanStok;
