import React, { useState, useEffect } from 'react';
import { HiOutlineTrendingUp, HiOutlineCurrencyDollar, HiOutlineShoppingBag } from 'react-icons/hi';
import { MdAnalytics } from 'react-icons/md';
import axios from 'axios';
import Layout from '../../components/Layout';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ( {
    Authorization: localStorage.getItem( 'authToken' ),
    'ngrok-skip-browser-warning': 'true',
} );

const formatRupiah = ( angka ) => 'Rp ' + angka.toLocaleString( 'id-ID' );

const AdminLaporanPenjualan = () => {
    const [ salesData, setSalesData ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    // Pagination
    const [ page, setPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const limit = 10;

    // Filter tanggal
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    useEffect( () => {
        fetchSalesData( page );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ page ] );

    // Fetch otomatis saat tanggal dipilih (hanya kalau sudah ada endDate atau reset filter)
    useEffect( () => {
        if ( ( startDate && endDate ) || ( !startDate && !endDate ) ) {
            setPage( 1 );
            fetchSalesData( 1 );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ startDate, endDate ] );

    const fetchSalesData = async ( pageNumber = page ) => {
        try {
            setLoading( true );
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/sales-reports/daily`,
                {
                    headers: getHeaders(),
                    params: {
                        page: pageNumber,
                        limit,
                        start_at: startDate ? startDate.toISOString().split( "T" )[ 0 ] : undefined,
                        end_at: endDate ? endDate.toISOString().split( "T" )[ 0 ] : undefined,
                    },
                }
            );
            const data = response.data?.data || [];
            const paging = response.data?.paging || {};

            setSalesData( data );
            setPage( paging.page || 1 );
            setTotalPages( paging.total_page || 1 );
            setTotalItems( paging.total_item || 0 );
        } catch ( err ) {
            console.error( 'Gagal mengambil data penjualan:', err );
            setSalesData( [] );
            setTotalPages( 1 );
            setTotalItems( 0 );
        } finally {
            setLoading( false );
        }
    };

    // Kalkulasi untuk cabang admin
    const totalTransactions = salesData.reduce( ( sum, item ) => sum + ( item.total_transactions || 0 ), 0 );
    const totalProductsSold = salesData.reduce( ( sum, item ) => sum + ( item.total_products_sold || 0 ), 0 );
    const totalRevenue = salesData.reduce( ( sum, item ) => sum + ( item.total_revenue || 0 ), 0 );

    // 📌 Pagination Component
    const Pagination = ( { page, setPage, totalPages, total, perPage } ) => {
        const startIndex = ( page - 1 ) * perPage;
        const endIndex = Math.min( startIndex + perPage, total );

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Menampilkan { total === 0 ? 0 : startIndex + 1 }-{ endIndex } dari { total } data
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={ () => setPage( 1 ) } disabled={ page === 1 }
                        className={ `px-2.5 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>
                        «
                    </button>
                    <button onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) } disabled={ page === 1 }
                        className={ `px-3 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>
                        Prev
                    </button>
                    <span className="text-sm text-gray-700">{ page } / { totalPages }</span>
                    <button onClick={ () => setPage( ( p ) => Math.min( totalPages, p + 1 ) ) } disabled={ page === totalPages }
                        className={ `px-3 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>
                        Next
                    </button>
                    <button onClick={ () => setPage( totalPages ) } disabled={ page === totalPages }
                        className={ `px-2.5 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>
                        »
                    </button>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header Section */ }
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <MdAnalytics className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Laporan Penjualan Cabang</h1>
                            <p className="text-sm text-gray-600">Hanya menampilkan data cabang yang Anda pegang</p>
                        </div>
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

                {/* Filter Tanggal */ }

                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rentang Tanggal
                        </label>
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
                </div>

                {/* Detail Data Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Total Transaksi</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Produk Terjual</th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 4 } className="px-6 py-6 text-center">
                                            Memuat data...
                                        </td>
                                    </tr>
                                ) : salesData.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 4 } className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada data penjualan
                                        </td>
                                    </tr>
                                ) : (
                                    salesData.map( ( item, index ) => (
                                        <tr key={ index } className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                { new Date( item.date ).toLocaleDateString( 'id-ID' ) }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                { item.total_transactions }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                { item.total_products_sold }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                { formatRupiah( item.total_revenue ) }
                                            </td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */ }
                    { totalPages > 1 && (
                        <Pagination
                            page={ page }
                            setPage={ setPage }
                            totalPages={ totalPages }
                            total={ totalItems }
                            perPage={ limit }
                        />
                    ) }
                </div>
            </div>
        </Layout>
    );
};

export default AdminLaporanPenjualan;
