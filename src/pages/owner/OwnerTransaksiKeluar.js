// src/pages/owner/OwnerTransaksiKeluar.js
import React, { useState, useEffect } from "react";
import { HiOutlineShoppingCart } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_URL = `${process.env.REACT_APP_API_URL}/sales`;

const getHeaders = () => ( {
    Authorization: localStorage.getItem( "authToken" ),
    "ngrok-skip-browser-warning": "true",
} );

const OwnerTransaksiKeluar = () => {
    const [ transactions, setTransactions ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    // filter state
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;
    const [ branchFilter, setBranchFilter ] = useState( "" );
    const [ searchTerm, setSearchTerm ] = useState( "" );

    // daftar cabang
    const [ branches, setBranches ] = useState( [] );

    // pagination
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

    useEffect( () => {
        fetchBranches();
    }, [] );

    // refetch saat filter berubah
    useEffect( () => {
        if ( ( startDate && !endDate ) || ( !startDate && endDate ) ) {
            return;
        }
        fetchTransactions( currentPage, searchTerm );
    }, [ startDate, endDate, branchFilter, currentPage, searchTerm ] );

    const fetchBranches = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/branches`,
                { headers: getHeaders() }
            );
            setBranches( res.data?.data || [] );
        } catch ( err ) {
            console.error( "Gagal memuat daftar cabang:", err );
        }
    };

    const fetchTransactions = async ( page, search ) => {
        try {
            setLoading( true );
            let params = { page };
            if ( startDate && endDate ) {
                const formatLocal = ( date ) => {
                    const d = new Date( date );
                    const year = d.getFullYear();
                    const month = String( d.getMonth() + 1 ).padStart( 2, "0" );
                    const day = String( d.getDate() ).padStart( 2, "0" );
                    return `${year}-${month}-${day}`;
                }

                params.start_at = formatLocal( startDate );
                params.end_at = formatLocal( endDate );
            }
            if ( search ) {
                params.search = searchTerm
            }
            if ( branchFilter ) params.branch_id = branchFilter;

            const res = await axios.get( API_URL, {
                headers: getHeaders(),
                params,
            } );

            const data = res.data?.data || res.data;
            const paging = res.data?.paging || {};

            setTransactions( data );
            setCurrentPage( paging.page || 1 );
            setTotalPages( paging.total_page || 1 );
            setTotalItems( paging.total_item || 0 );
        } catch ( err ) {
            console.error( "Failed to fetch sales transactions:", err );
            setTransactions( [] );
        } finally {
            setLoading( false );
        }
    };

    const resetFilters = () => {
        setDateRange( [ null, null ] );
        setBranchFilter( "" );
        setSearchTerm( "" );
        setCurrentPage( 1 );
        fetchTransactions( 1, "" );
    };

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

    const Pagination = ( { page, setPage, totalPages, total, perPage } ) => {
        const startIndex = ( page - 1 ) * perPage;
        const endIndex = Math.min( startIndex + perPage, total );

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Menampilkan { total === 0 ? 0 : startIndex + 1 }-{ endIndex } dari total { total } produk
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={ () => setPage( 1 ) }
                        disabled={ page === 1 }
                        className={ `px-2.5 py-1.5 rounded border ${page === 1
                            ? 'text-gray-400 border-gray-200'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                            }` }
                    >
                        «
                    </button>
                    <button
                        onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) }
                        disabled={ page === 1 }
                        className={ `px-3 py-1.5 rounded border ${page === 1
                            ? 'text-gray-400 border-gray-200'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
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
                            ? 'text-gray-400 border-gray-200'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                            }` }
                    >
                        Next
                    </button>
                    <button
                        onClick={ () => setPage( totalPages ) }
                        disabled={ page === totalPages }
                        className={ `px-2.5 py-1.5 rounded border ${page === totalPages
                            ? 'text-gray-400 border-gray-200'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                            }` }
                    >
                        »
                    </button>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */ }
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HiOutlineShoppingCart className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Transaksi Keluar
                            </h1>
                            <p className="text-sm text-gray-600">
                                Daftar transaksi penjualan per cabang
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    {/* Filter tanggal */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rentang Tanggal
                        </label>
                        <DatePicker
                            selectsRange={ true }
                            startDate={ startDate }
                            endDate={ endDate }
                            onChange={ ( update ) => setDateRange( update ) }
                            isClearable={ true }
                            dateFormat="dd/MM/yyyy"
                            className="border rounded px-3 py-2 text-sm w-60"
                            placeholderText="Pilih rentang tanggal"
                            maxDate={ new Date() }
                        />
                    </div>

                    {/* Filter cabang */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cabang
                        </label>
                        <select
                            value={ branchFilter }
                            onChange={ ( e ) => setBranchFilter( e.target.value ) }
                            className="border rounded px-3 py-2 text-sm"
                        >
                            <option value="">Semua Cabang</option>
                            { branches.map( ( b ) => (
                                <option key={ b.id } value={ b.id }>
                                    { b.name }
                                </option>
                            ) ) }
                        </select>
                    </div>

                    {/* Search */ }
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cari
                        </label>
                        <input
                            type="text"
                            value={ searchTerm }
                            onChange={ ( e ) => {
                                setSearchTerm( e.target.value );
                                setCurrentPage( 1 );
                            } }
                            placeholder="Cari kode / customer..."
                            className="border rounded px-3 py-2 text-sm w-60"
                        />
                    </div>

                    <button
                        onClick={ resetFilters }
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Reset
                    </button>
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Cabang
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 5 } className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">
                                                    Memuat data...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 5 } className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineShoppingCart className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Data tidak ada
                                                </h3>
                                                <p className="text-gray-500 text-sm">
                                                    { searchTerm
                                                        ? "Tidak ditemukan hasil pencarian"
                                                        : "Tidak ditemukan transaksi sesuai filter" }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map( ( trx ) => (
                                        <tr key={ trx.code } className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-600">
                                                { trx.customer_name }
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                { trx.code }
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                { trx.branch_name }
                                            </td>
                                            <td
                                                className={ `px-6 py-4 font-semibold ${trx.status === "COMPLETED"
                                                    ? "text-green-600"
                                                    : "text-yellow-600"
                                                    }` }
                                            >
                                                { trx.status }
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                { formatDate( trx.created_at ) }
                                            </td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 📑 Pagination */ }
                { totalPages > 1 && (
                    <Pagination
                        page={ currentPage }
                        setPage={ setCurrentPage }
                        totalPages={ totalPages }
                        total={ totalItems }
                        perPage={ transactions.length }
                    />
                ) }

            </div>
        </Layout>
    );
};

export default OwnerTransaksiKeluar;
