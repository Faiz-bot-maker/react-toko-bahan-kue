// src/pages/owner/OwnerLaporanPengeluaran.js
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { HiOutlineDocumentReport } from "react-icons/hi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const getHeaders = () => ( {
  Authorization: localStorage.getItem( "authToken" ),
  "ngrok-skip-browser-warning": "true",
} );

const formatRupiah = ( angka ) =>
  "Rp " + ( angka || 0 ).toLocaleString( "id-ID" );

// 🔹 Pagination Component Reusable
const Pagination = ( { page, setPage, totalPages, totalItems, perPage } ) => {
  if ( totalPages <= 1 ) return null;

  const startIndex = ( page - 1 ) * perPage + 1;
  const endIndex = Math.min( page * perPage, totalItems );

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 mt-6">
      <div className="text-sm text-gray-600">
        Menampilkan { totalItems === 0 ? 0 : startIndex }-{ endIndex } dari { totalItems } data
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={ () => setPage( 1 ) }
          disabled={ page === 1 }
          className={ `px-3 py-1.5 rounded border ${page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }` }
        >
          «
        </button>
        <button
          onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) }
          disabled={ page === 1 }
          className={ `px-3 py-1.5 rounded border ${page === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }` }
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">{ page } / { totalPages }</span>
        <button
          onClick={ () => setPage( ( p ) => Math.min( totalPages, p + 1 ) ) }
          disabled={ page === totalPages }
          className={ `px-3 py-1.5 rounded border ${page === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }` }
        >
          Next
        </button>
        <button
          onClick={ () => setPage( totalPages ) }
          disabled={ page === totalPages }
          className={ `px-3 py-1.5 rounded border ${page === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }` }
        >
          »
        </button>
      </div>
    </div>
  );
};

const OwnerLaporanPengeluaran = () => {
  const [ summaryRows, setSummaryRows ] = useState( [] );
  const [ totalAll, setTotalAll ] = useState( 0 );
  const [ loadingSummary, setLoadingSummary ] = useState( true );

  const [ branches, setBranches ] = useState( [] );
  const [ branchMap, setBranchMap ] = useState( {} );

  const [ detailRows, setDetailRows ] = useState( [] );
  const [ loadingDetail, setLoadingDetail ] = useState( true );

  const [ page, setPage ] = useState( 1 );
  const [ size ] = useState( 10 );
  const [ totalPage, setTotalPage ] = useState( 1 );
  const [ totalItems, setTotalItems ] = useState( 0 );

  // filter state
  const [ dateRange, setDateRange ] = useState( [ null, null ] );
  const [ startDate, endDate ] = dateRange;
  const [ branchFilter, setBranchFilter ] = useState( "" );
  const [ search, setSearch ] = useState( "" );

  // Fetch summary
  const fetchSummary = async () => {
    try {
      setLoadingSummary( true );
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/expenses/consolidated`,
        { headers: getHeaders() }
      );
      const payload = res.data || {};
      const data = Array.isArray( payload.data ) ? payload.data : [];
      setSummaryRows( data );
      setTotalAll( payload.total_all_branches || 0 );

      const mapping = {};
      data.forEach( ( b ) => {
        mapping[ b.branch_id ] = b.branch_name;
      } );
      setBranchMap( mapping );
    } catch ( err ) {
      console.error( "Gagal memuat summary:", err );
    } finally {
      setLoadingSummary( false );
    }
  };

  // Fetch daftar cabang
  const fetchBranches = async () => {
    try {
      const res = await axios.get( `${process.env.REACT_APP_API_URL}/branches`, {
        headers: getHeaders(),
      } );
      const data = Array.isArray( res.data?.data ) ? res.data.data : [];
      setBranches( data );
    } catch ( err ) {
      console.error( "Gagal memuat daftar cabang:", err );
      setBranches( [] );
    }
  };

  // Fetch detail (pagination + filter)
  const fetchDetail = async ( pageNumber = 1 ) => {
    try {
      setLoadingDetail( true );

      const params = new URLSearchParams();
      params.append( "page", pageNumber );
      params.append( "size", size );

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
      if ( branchFilter ) params.append( "branch_id", branchFilter );
      if ( search ) params.append( "search", search );

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/expenses?${params.toString()}`,
        { headers: getHeaders() }
      );

      const payload = res.data || {};
      setDetailRows( Array.isArray( payload.data ) ? payload.data : [] );
      setTotalPage( payload.paging?.total_page || 1 );
      setTotalItems( payload.paging?.total_item || ( Array.isArray( payload.data ) ? payload.data.length : 0 ) );
    } catch ( err ) {
      console.error( "Gagal memuat detail:", err );
    } finally {
      setLoadingDetail( false );
    }
  };

  useEffect( () => {
    fetchSummary();
    fetchBranches();
  }, [] );

  useEffect( () => {
    fetchDetail( page );
  }, [ page, branchFilter, startDate, endDate, search ] );

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */ }
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 rounded-xl">
            <HiOutlineDocumentReport className="text-2xl text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Pengeluaran</h1>
            <p className="text-sm text-gray-600">
              Ringkasan total & detail pengeluaran semua cabang
            </p>
          </div>
        </div>

        {/* Ringkasan */ }
        <h2 className="text-xl font-semibold mb-3">Ringkasan Per Cabang</h2>
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden mb-10">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                  Cabang
                </th>
                <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                  Total Pengeluaran
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              { loadingSummary ? (
                <tr>
                  <td colSpan={ 2 } className="px-6 py-12 text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : summaryRows.length === 0 ? (
                <tr>
                  <td colSpan={ 2 } className="px-6 py-12 text-center text-gray-500">
                    Data tidak ada
                  </td>
                </tr>
              ) : (
                summaryRows.map( ( row, idx ) => (
                  <tr key={ row.branch_id || idx } className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{ row.branch_name }</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right font-semibold">
                      { formatRupiah( row.total_expenses ) }
                    </td>
                  </tr>
                ) )
              ) }
            </tbody>
            { !loadingSummary && (
              <tfoot>
                <tr className="bg-gradient-to-r from-gray-200 to-gray-300">
                  <td className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                    Total Semua Cabang
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    { formatRupiah( totalAll ) }
                  </td>
                </tr>
              </tfoot>
            ) }
          </table>
        </div>

        {/* Filter & Reset */ }
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-wrap gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <DatePicker
              selectsRange
              startDate={ startDate }
              endDate={ endDate }
              onChange={ ( update ) => {
                setDateRange( update );
                setPage( 1 );
              } }
              isClearable
              maxDate={ new Date() }
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih rentang tanggal"
              className="border rounded-md px-3 py-2 text-sm w-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
            <select
              value={ branchFilter }
              onChange={ ( e ) => {
                setBranchFilter( e.target.value );
                setPage( 1 );
              } }
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">Semua Cabang</option>
              { branches.map( ( b ) => (
                <option key={ b.id } value={ b.id }>{ b.name }</option>
              ) ) }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Deskripsi</label>
            <input
              type="text"
              value={ search }
              onChange={ ( e ) => {
                setSearch( e.target.value );
                setPage( 1 );
              } }
              placeholder="Masukkan kata kunci..."
              className="border rounded-md px-3 py-2 text-sm w-60"
            />
          </div>

          <button
            onClick={ () => {
              setDateRange( [ null, null ] );
              setBranchFilter( "" );
              setSearch( "" );
              setPage( 1 );
            } }
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
        </div>

        {/* Tabel Detail */ }
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cabang</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Deskripsi</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              { loadingDetail ? (
                <tr>
                  <td colSpan={ 4 } className="px-6 py-12 text-center">Memuat data...</td>
                </tr>
              ) : detailRows.length === 0 ? (
                <tr>
                  <td colSpan={ 4 } className="px-6 py-12 text-center text-gray-500">Data tidak ada</td>
                </tr>
              ) : (
                detailRows.map( ( row, idx ) => (
                  <tr key={ row.id || idx } className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      { row.created_at ? new Date( row.created_at ).toLocaleDateString( "id-ID" ) : "-" }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      { branches.find( ( b ) => b.id === row.branch_id )?.name || row.branch_name || "-" }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{ row.description || "-" }</td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right font-semibold">{ formatRupiah( row.amount ) }</td>
                  </tr>
                ) )
              ) }
            </tbody>
          </table>
        </div>

        {/* Pagination */ }
        <Pagination
          page={ page }
          setPage={ setPage }
          totalPages={ totalPage }
          totalItems={ totalItems }
          perPage={ size }
        />
      </div>
    </Layout>
  );
};

export default OwnerLaporanPengeluaran;
