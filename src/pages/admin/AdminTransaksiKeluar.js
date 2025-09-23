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

    // Filter tanggal
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    // Search
    const [ search, setSearch ] = useState( "" );

    // Pagination
    const [ page, setPage ] = useState( 1 );
    const [ size ] = useState( 10 );
    const [ totalPage, setTotalPage ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

    const fetchSales = async ( targetPage = page ) => {
        try {
            setLoading( true );
            let params = {
                page: targetPage,
                size,
            };
            if ( startDate ) params.start_at = startDate.toISOString().split( "T" )[ 0 ];
            if ( endDate ) params.end_at = endDate.toISOString().split( "T" )[ 0 ];
            if ( search ) params.search = search;

            const res = await axios.get( API_URL, {
                headers: getHeaders(),
                params,
            } );

            setSales( res.data?.data || [] );
            if ( res.data?.paging ) {
                setTotalPage( res.data.paging.total_page );
                setTotalItems( res.data.paging.total_item );
            }
        } catch ( err ) {
            console.error( "Gagal memuat data penjualan:", err );
            setSales( [] );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        fetchSales();
    }, [ page, startDate, endDate, search ] );

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

    return (
        <Layout>
            <div className="w-full max-w-6xl mx-auto">
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
                    <div>
                    </div>
                </div>

                {/* Filter Tanggal + Search */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-end gap-2">
                    {/* Search */ }
                    <div>
                        <input
                            type="text"
                            placeholder="Cari kode atau nama customer..."
                            value={ search }
                            onChange={ ( e ) => { setSearch( e.target.value ); setPage( 1 ); } }
                            className="border rounded px-3 py-2 text-sm w-64"
                        />
                    </div>

                    {/* Filter Tanggal */ }
                    <div>
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
                                            <td className="px-6 py-4 text-gray-600">{ sale.customer_name }</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{ sale.code }</td>
                                            <td
                                                className={ `px-6 py-4 font-medium ${sale.status.toUpperCase() === "COMPLETED"
                                                    ? "text-green-600"
                                                    : "text-gray-600"
                                                    }` }
                                            >
                                                { sale.status }
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">{ sale.branch_name }</td>
                                            <td className="px-6 py-4 text-gray-600">{ formatDate( sale.created_at ) }</td>
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
            </div>
        </Layout>
    );
};

export default AdminTransaksiKeluar;
