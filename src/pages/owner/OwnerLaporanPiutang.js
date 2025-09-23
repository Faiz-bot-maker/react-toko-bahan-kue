import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
    VOID: 'bg-gray-100 text-gray-600',
    PAID: 'bg-green-100 text-green-800', // tambahan
};

const formatRupiah = ( angka ) => 'Rp ' + angka.toLocaleString( 'id-ID' );

const getHeaders = () => ( {
    Authorization: localStorage.getItem( 'authToken' ),
    "ngrok-skip-browser-warning": "true",
} );

const OwnerLaporanPiutang = () => {
    const [ data, setData ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    // Modal
    const [ showModal, setShowModal ] = useState( false );
    const [ detailData, setDetailData ] = useState( null );
    const [ loadingDetail, setLoadingDetail ] = useState( false );

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
                };

                params.append( "start_at", formatLocal( startDate ) );
                params.append( "end_at", formatLocal( endDate ) );
            }

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

    const fetchDetail = async ( id ) => {
        try {
            setLoadingDetail( true );
            const res = await axios.get( `${API_URL}/${id}`, { headers: getHeaders() } );
            setDetailData( res.data?.data || res.data );
            setShowModal( true );
        } catch ( err ) {
            console.error( "Gagal fetch detail piutang:", err );
            setDetailData( null );
        } finally {
            setLoadingDetail( false );
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
                {/* ... bagian summary & filters tetap ... */ }

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
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                { loading ? (
                                    <tr><td colSpan={ 8 } className="px-6 py-12 text-center">Memuat data...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={ 8 } className="px-6 py-12 text-center">Tidak ada data</td></tr>
                                ) : data.map( ( d ) => (
                                    <tr key={ d.id } className="hover:bg-gray-50">
                                        <td className="px-6 py-4">{ d.related }</td>
                                        <td className="px-6 py-4">{ d.reference_code }</td>
                                        <td className="px-6 py-4">{ formatRupiah( d.total_amount || 0 ) }</td>
                                        <td className="px-6 py-4"><span className={ `px-3 py-1 rounded-full text-xs ${statusColor[ d.status ]}` }>{ d.status }</span></td>
                                        <td className="px-6 py-4">{ d.branch_name }</td>
                                        <td className="px-6 py-4">{ d.due_date ? formatDate( d.due_date ) : '-' }</td>
                                        <td className="px-6 py-4">{ d.created_at ? formatDate( d.created_at ) : '-' }</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={ () => fetchDetail( d.id ) }
                                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-[#11493E]"
                                            >
                                                Detail
                                            </button>
                                        </td>
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

                {/* Modal Detail */ }
                { showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                            <button
                                onClick={ () => setShowModal( false ) }
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                            >
                                ✕
                            </button>
                            { loadingDetail ? (
                                <p>Memuat detail...</p>
                            ) : detailData ? (
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold">Detail Piutang</h2>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <p><span className="font-medium">Referensi:</span> { detailData.reference_code }</p>
                                        <p><span className="font-medium">Jenis:</span> { detailData.reference_type }</p>
                                        <p><span className="font-medium">Jumlah:</span> { formatRupiah( detailData.total_amount ) }</p>
                                        <p><span className="font-medium">Terbayar:</span> { formatRupiah( detailData.paid_amount ) }</p>
                                        <p><span className="font-medium">Jatuh Tempo:</span> { detailData.due_date ? formatDate( detailData.due_date ) : '-' }</p>
                                        <p><span className="font-medium">Status:</span> <span className={ `px-2 py-1 rounded text-xs ${statusColor[ detailData.status ]}` }>{ detailData.status }</span></p>
                                    </div>

                                    {/* Items */ }
                                    <div>
                                        <h3 className="font-semibold mb-2">Items</h3>
                                        <table className="w-full text-sm border">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 border">Produk</th>
                                                    <th className="px-3 py-2 border">Ukuran</th>
                                                    <th className="px-3 py-2 border">Qty</th>
                                                    <th className="px-3 py-2 border">Harga</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { detailData.items?.map( ( item, i ) => (
                                                    <tr key={ i }>
                                                        <td className="px-3 py-2 border">{ item.product_name }</td>
                                                        <td className="px-3 py-2 border">{ item.size_name }</td>
                                                        <td className="px-3 py-2 border">{ item.qty }</td>
                                                        <td className="px-3 py-2 border">{ formatRupiah( item.sell_price ) }</td>
                                                    </tr>
                                                ) ) }
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Payments */ }
                                    <div>
                                        <h3 className="font-semibold mb-2">Pembayaran</h3>
                                        { detailData.payments?.length > 0 ? (
                                            <table className="w-full text-sm border">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="px-3 py-2 border">Tanggal</th>
                                                        <th className="px-3 py-2 border">Jumlah</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    { detailData.payments.map( ( p ) => (
                                                        <tr key={ p.id }>
                                                            <td className="px-3 py-2 border">{ formatDate( p.payment_date ) }</td>
                                                            <td className="px-3 py-2 border">{ formatRupiah( p.amount ) }</td>
                                                        </tr>
                                                    ) ) }
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p className="text-sm text-gray-500">Belum ada pembayaran</p>
                                        ) }
                                    </div>
                                </div>
                            ) : (
                                <p>Tidak ada detail ditemukan</p>
                            ) }
                        </div>
                    </div>
                ) }
            </div>
        </Layout>
    );
};

export default OwnerLaporanPiutang;
