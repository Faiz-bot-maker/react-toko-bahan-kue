// src/pages/owner/AdminLaporanPembelian.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HiOutlineCurrencyDollar, HiOutlineDocumentReport, HiOutlineShoppingBag, HiOutlineTrendingUp } from "react-icons/hi";

const API_URL = `${process.env.REACT_APP_API_URL}/purchases-reports/daily`;

const getHeaders = () => ( {
    Authorization: localStorage.getItem( "authToken" ),
    "ngrok-skip-browser-warning": "true",
} );

const formatRupiah = ( angka ) => 'Rp ' + angka.toLocaleString( 'id-ID' );

const AdminLaporanPembelian = () => {
    const [ reports, setReports ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

    useEffect( () => {
        fetchReports( currentPage );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ currentPage ] );

    useEffect( () => {
        setCurrentPage( 1 );
        fetchReports( 1 );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ endDate ] );

    const totalTransactions = reports.reduce( ( sum, item ) => sum + ( item.total_transactions || 0 ), 0 );
    const totalProductsSold = reports.reduce( ( sum, item ) => sum + ( item.total_products_buy || 0 ), 0 );
    const totalRevenue = reports.reduce( ( sum, item ) => sum + ( item.total_purchases || 0 ), 0 );


    const fetchReports = async ( page ) => {
        try {
            setLoading( true );
            let params = { page };

            if ( startDate && endDate ) {
                const formatDate = ( date ) => {
                    const d = new Date( date );
                    const year = d.getFullYear();
                    const month = String( d.getMonth() + 1 ).padStart( 2, "0" );
                    const day = String( d.getDate() ).padStart( 2, "0" );
                    return `${year}-${month}-${day}`;
                };
                params.start_at = formatDate( startDate );
                params.end_at = formatDate( endDate );
            }

            const res = await axios.get( API_URL, {
                headers: getHeaders(),
                params,
            } );

            const data = res.data?.data || [];
            const paging = res.data?.paging || {};

            setReports( data );
            setCurrentPage( paging.page || 1 );
            setTotalPages( paging.total_page || 1 );
            setTotalItems( paging.total_item || 0 );
        } catch ( err ) {
            console.error( "Gagal memuat laporan pembelian:", err );
            setReports( [] );
        } finally {
            setLoading( false );
        }
    };

    const resetFilters = () => {
        setDateRange( [ null, null ] );
        setCurrentPage( 1 );
        fetchReports( 1 );
    };

    const formatDateDisplay = ( dateString ) => {
        const d = new Date( dateString );
        return d.toLocaleDateString( "id-ID", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
        } );
    };

    const Pagination = ( { page, setPage, totalPages, total, perPage } ) => {
        const startIndex = ( page - 1 ) * perPage;
        const endIndex = Math.min( startIndex + perPage, total );

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Menampilkan { total === 0 ? 0 : startIndex + 1 }-{ endIndex } dari total { total }
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

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header with Icon */ }
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                        <HiOutlineShoppingBag className="text-4xl text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Laporan Pembelian Harian
                        </h1>
                        <p className="text-sm text-gray-600">
                            Hanya menampilkan data pembelian cabang yang Anda kelola
                        </p>
                    </div>
                </div>

                {/* Summary Cards */ }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <HiOutlineTrendingUp className="text-2xl text-blue-600" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Total Transaksi</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">{ totalTransactions }</div>
                        <p className="text-xs text-gray-600">Transaksi</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <HiOutlineShoppingBag className="text-2xl text-green-600" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Total Produk Terjual</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">{ totalProductsSold }</div>
                        <p className="text-xs text-gray-600">Unit</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <HiOutlineCurrencyDollar className="text-2xl text-purple-600" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Total Pendapatan</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">{ formatRupiah( totalRevenue ) }</div>
                        <p className="text-xs text-gray-600">Rupiah</p>
                    </div>
                </div>

                {/* Filters */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
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
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Total Transaksi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Total Produk Beli
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                                        Total Pembelian (Rp)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 4 } className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">
                                                    Memuat data...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 4 }>
                                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
                                                <HiOutlineDocumentReport className="text-5xl text-gray-300" />
                                                <span className="text-xl font-semibold text-center">
                                                    Tidak ditemukan data laporan pembelian.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map( ( report, idx ) => (
                                        <tr key={ idx } className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                { formatDateDisplay( report.date ) }
                                            </td>
                                            <td className="px-6 py-4">{ report.total_transactions }</td>
                                            <td className="px-6 py-4">{ report.total_products_buy }</td>
                                            <td className="px-6 py-4">
                                                Rp{ report.total_purchases.toLocaleString( "id-ID" ) }
                                            </td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>
                    { totalPages > 1 && (
                        <Pagination
                            page={ currentPage }
                            setPage={ setCurrentPage }
                            totalPages={ totalPages }
                            total={ totalItems }
                            perPage={ reports.length }
                        />
                    ) }
                </div>
            </div>
        </Layout>
    );
};

export default AdminLaporanPembelian;
