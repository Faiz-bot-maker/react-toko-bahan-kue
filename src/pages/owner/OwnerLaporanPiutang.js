import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
    VOID: 'bg-gray-100 text-gray-600',
};

const formatRupiah = ( angka ) => 'Rp ' + angka.toLocaleString( 'id-ID' );

const getHeaders = () => ( {
    Authorization: localStorage.getItem( 'authToken' ),
    "ngrok-skip-browser-warning": "true",
} );

const OwnerLaporanPiutang = () => {
    const [ data, setData ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    // Filter
    const [ searchTerm, setSearchTerm ] = useState( '' );
    const [ branchFilter, setBranchFilter ] = useState( '' );
    const [ branches, setBranches ] = useState( [] );
    const [ dateRange, setDateRange ] = useState( [ null, null ] );
    const [ appliedDateRange, setAppliedDateRange ] = useState( [ null, null ] );
    const [ startDate, endDate ] = dateRange;

    // Pagination
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

    const API_URL = `${process.env.REACT_APP_API_URL}/debt`;

    // Fetch branch list
    useEffect( () => {
        const fetchBranches = async () => {
            try {
                const res = await axios.get( `${process.env.REACT_APP_API_URL}/branches`, { headers: getHeaders() } );
                setBranches( res.data?.data || [] );
            } catch ( err ) {
                console.error( "Gagal fetch branch:", err );
            }
        };
        fetchBranches();
    }, [] );

    // Fetch data otomatis saat filter/pagination berubah
    useEffect( () => {
        if ( ( startDate && !endDate ) || ( !startDate && endDate ) ) return;
        fetchData( currentPage, searchTerm );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ currentPage, searchTerm, branchFilter, appliedDateRange ] );

    const fetchData = async ( page = 1, search = '' ) => {
        try {
            setLoading( true );

            const params = new URLSearchParams();
            params.append( 'page', page );
            params.append( 'size', 10 );
            if ( branchFilter ) params.append( 'branch_id', branchFilter );

            if ( startDate && endDate ) {
                const formatLocal = ( date ) => {
                    const d = new Date( date );
                    const year = d.getFullYear();
                    const month = String( d.getMonth() + 1 ).padStart( 2, "0" );
                    const day = String( d.getDate() ).padStart( 2, "0" );
                    return `${year}-${month}-${day}`;
                }

                params.append( "start_at", formatLocal( startDate ) );
                params.append( "end_at", formatLocal( endDate ) );
            }

            // if ( appliedDateRange[ 0 ] ) params.append( 'start_at', appliedDateRange[ 0 ].toISOString().split( 'T' )[ 0 ] );
            // if ( appliedDateRange[ 1 ] ) params.append( 'end_at', appliedDateRange[ 1 ].toISOString().split( 'T' )[ 0 ] );
            if ( search ) params.append( 'search', search );

            const res = await axios.get( API_URL, { headers: getHeaders(), params } );
            const result = res.data?.data || res.data;
            const paging = res.data?.paging || {};
            setData( result );
            setCurrentPage( paging.page || 1 );
            setTotalPages( paging.total_page || 1 );
            setTotalItems( paging.total_item || result.length );
        } catch ( err ) {
            console.error( "Gagal fetch data piutang:", err );
            setData( [] );
        } finally {
            setLoading( false );
        }
    };

    const resetFilters = () => {
        setSearchTerm( '' );
        setBranchFilter( '' );
        setDateRange( [ null, null ] );
        setAppliedDateRange( [ null, null ] );
        setCurrentPage( 1 );
        fetchData( 1 );
    };

    const formatDate = ( timestamp ) => {
        const d = new Date( timestamp );
        return d.toLocaleDateString( "id-ID" );
    };

    const totalPiutang = 0;
    const totalLunas = 0;

    // Pagination component
    const Pagination = ( { page, setPage, totalPages, total, perPage } ) => {
        const startIndex = ( page - 1 ) * perPage;
        const endIndex = Math.min( startIndex + perPage, total );

        return (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    Menampilkan { total === 0 ? 0 : startIndex + 1 }-{ endIndex } dari total { total } piutang
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={ () => setPage( 1 ) } disabled={ page === 1 } className="px-2.5 py-1.5 rounded border">{ '«' }</button>
                    <button onClick={ () => setPage( p => Math.max( 1, p - 1 ) ) } disabled={ page === 1 } className="px-3 py-1.5 rounded border">Prev</button>
                    <span className="text-sm text-gray-700">{ page } / { totalPages }</span>
                    <button onClick={ () => setPage( p => Math.min( totalPages, p + 1 ) ) } disabled={ page === totalPages } className="px-3 py-1.5 rounded border">Next</button>
                    <button onClick={ () => setPage( totalPages ) } disabled={ page === totalPages } className="px-2.5 py-1.5 rounded border">{ '»' }</button>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */ }
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Laporan Piutang</h1>
                        <p className="text-sm text-gray-600">Kelola data piutang pelanggan</p>
                    </div>
                </div>

                {/* Summary */ }
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Piutang</p>
                        <p className="text-2xl font-bold text-red-600">{ formatRupiah( totalPiutang ) }</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Lunas</p>
                        <p className="text-2xl font-bold text-green-600">{ formatRupiah( totalLunas ) }</p>
                    </div>
                </div>

                {/* Filters */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                        <input
                            type="text"
                            value={ searchTerm }
                            onChange={ ( e ) => {
                                setSearchTerm( e.target.value );
                                setCurrentPage( 1 );
                            } }
                            placeholder="Cari nama pelanggan / kode..."
                            className="border rounded px-3 py-2 text-sm w-60"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
                        <select
                            value={ branchFilter }
                            onChange={ ( e ) => {
                                setBranchFilter( e.target.value );
                                setCurrentPage( 1 );
                            } }
                            className="border rounded px-3 py-2 text-sm w-60"
                        >
                            <option value="">Semua Cabang</option>
                            { branches.map( branch => (
                                <option key={ branch.id } value={ branch.id }>{ branch.name }</option>
                            ) ) }
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal Hutang</label>
                        <DatePicker
                            selectsRange
                            startDate={ startDate }
                            endDate={ endDate }
                            onChange={ ( update ) => {
                                setDateRange( update );
                                if ( update[ 0 ] && update[ 1 ] ) {
                                    setAppliedDateRange( [ update[ 0 ], update[ 1 ] ] );
                                    setCurrentPage( 1 );
                                }
                                if ( !update[ 0 ] && !update[ 1 ] ) {
                                    setAppliedDateRange( [ null, null ] );
                                    setCurrentPage( 1 );
                                }
                            } }
                            isClearable
                            dateFormat="dd/MM/yyyy"
                            className="border rounded px-3 py-2 text-sm w-60"
                        />
                    </div>

                    <button onClick={ resetFilters } className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Reset</button>
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nama Pelanggan</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Referensi</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Jumlah Piutang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cabang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal Hutang</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal Bayar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr><td colSpan={ 7 } className="px-6 py-12 text-center">Memuat data...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={ 7 } className="px-6 py-12 text-center">Tidak ada data</td></tr>
                                ) : data.map( ( d ) => (
                                    <tr key={ d.id } className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{ d.related }</td>
                                        <td className="px-6 py-4">{ d.reference_code }</td>
                                        <td className="px-6 py-4">{ formatRupiah( d.total_amount || 0 ) }</td>
                                        <td className="px-6 py-4"><span className={ `px-3 py-1 rounded-full text-xs ${statusColor[ d.status ]}` }>{ d.status }</span></td>
                                        <td className="px-6 py-4">{ d.branch_name }</td>
                                        <td className="px-6 py-4">{ d.due_date ? formatDate( d.due_date ) : '-' }</td>
                                        <td className="px-6 py-4">{ d.created_at ? formatDate( d.created_at ) : '-' }</td>
                                    </tr>
                                ) ) }
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
                        perPage={ data.length }
                    />
                ) }
            </div>
        </Layout>
    );
};

export default OwnerLaporanPiutang;
