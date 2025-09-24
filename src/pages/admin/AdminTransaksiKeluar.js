// src/pages/admin/AdminTransaksiKeluar.js
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

const AdminTransaksiKeluar = () => {
    const [ sales, setSales ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ appliedDateRange, setAppliedDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    const [ search, setSearch ] = useState( "" );

    const [ page, setPage ] = useState( 1 );
    const [ size ] = useState( 10 );
    const [ totalPage, setTotalPage ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

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

    const fetchSales = async ( targetPage = page, searchTerm = search ) => {
        try {
            setLoading( true );
            let params = { page: targetPage, size };
            const [ appliedStart, appliedEnd ] = appliedDateRange;

            if ( appliedStart && appliedEnd ) {
                const formatLocal = ( date ) => {
                    const d = new Date( date );
                    const year = d.getFullYear();
                    const month = String( d.getMonth() + 1 ).padStart( 2, "0" );
                    const day = String( d.getDate() ).padStart( 2, "0" );
                    return `${year}-${month}-${day}`;
                };
                params.start_at = formatLocal( appliedStart );
                params.end_at = formatLocal( appliedEnd );
            }

            if ( searchTerm ) params.search = searchTerm;

            const res = await axios.get( API_URL, { headers: getHeaders(), params } );
            setSales( res.data?.data || [] );
            if ( res.data?.paging ) {
                setTotalPage( res.data.paging.total_page );
                setTotalItems( res.data.paging.total_item );
            } else {
                setTotalPage( 1 );
                setTotalItems( res.data?.data?.length || 0 );
            }
        } catch ( err ) {
            console.error( "Gagal memuat data penjualan:", err );
            setSales( [] );
            setTotalPage( 1 );
            setTotalItems( 0 );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchSales( page, search );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ page, appliedDateRange, search ] );

    const resetFilters = () => {
        setSearch( "" );
        setDateRange( [ null, null ] );
        setAppliedDateRange( [ null, null ] );
        setPage( 1 );
        fetchSales( 1, "" );
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */ }
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gray-200 rounded-lg">
                            <HiOutlineShoppingCart className="text-2xl text-gray-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Data Penjualan</h1>
                            <p className="text-sm text-gray-600">Catatan transaksi penjualan cabang Anda</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tanggal + Search */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    <input
                        type="text"
                        placeholder="Cari kode atau nama customer..."
                        value={ search }
                        onChange={ ( e ) => { setSearch( e.target.value ); setPage( 1 ); } }
                        className="border rounded px-3 py-2 text-sm w-64"
                    />
                    <DatePicker
                        selectsRange
                        startDate={ startDate }
                        endDate={ endDate }
                        onChange={ ( update ) => {
                            setDateRange( update );
                            const [ start, end ] = update;
                            if ( start && end ) {
                                setAppliedDateRange( [ start, end ] );
                                setPage( 1 );
                            }
                        } }
                        isClearable
                        dateFormat="dd/MM/yyyy"
                        className="border rounded px-3 py-2 text-sm w-60"
                        placeholderText="Pilih rentang tanggal"
                    />
                    <button onClick={ resetFilters } className="bg-gray-300 px-4 py-2 rounded">Reset</button>
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Kode</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cabang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr>
                                        <td colSpan={ 5 } className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 5 } className="px-6 py-16 text-center text-gray-500">
                                            Tidak ditemukan penjualan
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map( ( sale ) => (
                                        <tr key={ sale.code } className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-gray-700">{ sale.customer_name }</td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{ sale.code }</td>
                                            <td className={ `px-6 py-3 font-medium ${sale.status.toUpperCase() === "COMPLETED" ? "text-green-600" : "text-gray-600"}` }>
                                                { sale.status }
                                            </td>
                                            <td className="px-6 py-3 text-gray-700">{ sale.branch_name }</td>
                                            <td className="px-6 py-3 text-gray-700">{ formatDate( sale.created_at ) }</td>
                                        </tr>
                                    ) )
                                ) }
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */ }
                    { sales.length > 0 && totalItems > 0 && (
                        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500">
                                Menampilkan { ( page - 1 ) * size + 1 }–{ Math.min( page * size, totalItems ) } dari { totalItems } data
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={ () => setPage( 1 ) } disabled={ page === 1 } className={ `px-2.5 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>«</button>
                                <button onClick={ () => setPage( p => Math.max( 1, p - 1 ) ) } disabled={ page === 1 } className={ `px-3 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>Prev</button>
                                <span className="text-sm text-gray-700">{ page } / { totalPage }</span>
                                <button onClick={ () => setPage( p => Math.min( totalPage, p + 1 ) ) } disabled={ page === totalPage || totalPage === 0 } className={ `px-3 py-1.5 rounded border ${page === totalPage || totalPage === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>Next</button>
                                <button onClick={ () => setPage( totalPage ) } disabled={ page === totalPage || totalPage === 0 } className={ `px-2.5 py-1.5 rounded border ${page === totalPage || totalPage === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }>»</button>
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        </Layout>
    );
};

export default AdminTransaksiKeluar;
