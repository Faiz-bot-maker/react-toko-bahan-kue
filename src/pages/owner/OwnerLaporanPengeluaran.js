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

const formatRupiah = ( angka ) => "Rp " + ( angka || 0 ).toLocaleString( "id-ID" );

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

      if ( startDate ) {
        params.append( "start_at", startDate.toISOString().split( "T" )[ 0 ] );
      }
      if ( endDate ) {
        params.append( "end_at", endDate.toISOString().split( "T" )[ 0 ] );
      }
      if ( branchFilter ) {
        params.append( "branch_id", branchFilter );
      }
      if ( search ) {
        params.append( "search", search );
      }

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/expenses?${params.toString()}`,
        { headers: getHeaders() }
      );
      const payload = res.data || {};
      setDetailRows( Array.isArray( payload.data ) ? payload.data : [] );
      setTotalPage( payload.paging?.total_page || 1 );
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

        {/* Detail */ }
        <h2 className="text-xl font-semibold mb-3">Detail Pengeluaran</h2>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          {/* Tanggal */ }
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
            <DatePicker
              selectsRange
              startDate={ startDate }
              endDate={ endDate }
              onChange={ ( update ) => {
                setDateRange( update );

                // Reset page & fetch
                if ( !update[ 0 ] && !update[ 1 ] ) fetchDetail( 1 );
                if ( update[ 0 ] && update[ 1 ] ) fetchDetail( 1 );
                setPage( 1 );
              } }
              isClearable
              maxDate={ new Date() }
              dateFormat="dd/MM/yyyy"
              placeholderText="Pilih rentang tanggal"
              className="border rounded-md px-3 py-2 text-sm w-60"
            />
          </div>

          {/* Cabang */ }
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
            <select
              value={ branchFilter }
              onChange={ ( e ) => {
                setBranchFilter( e.target.value );
                setPage( 1 );
                if ( e.target.value === "" ) fetchDetail( 1 );
              } }
              className="border rounded-md px-3 py-2 text-sm"
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

          {/* Reset */ }
          <button
            onClick={ () => {
              setDateRange( [ null, null ] );
              setBranchFilter( "" );
              setSearch( "" );
              setPage( 1 );
              fetchDetail( 1 );
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
                      { branches.find( ( b ) => b.id === row.branch_name )?.name || row.branch_name }
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
        { !loadingDetail && totalPage > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={ () => setPage( ( prev ) => Math.max( prev - 1, 1 ) ) }
              disabled={ page === 1 }
              className={ `px-4 py-2 rounded-lg text-sm font-medium ${page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-800"}` }
            >
              Sebelumnya
            </button>

            <div className="text-sm text-gray-600">
              Halaman <span className="font-semibold">{ page }</span> dari <span className="font-semibold">{ totalPage }</span>
            </div>

            <button
              onClick={ () => setPage( ( prev ) => Math.min( prev + 1, totalPage ) ) }
              disabled={ page === totalPage }
              className={ `px-4 py-2 rounded-lg text-sm font-medium ${page === totalPage
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-800"}` }
            >
              Berikutnya
            </button>
          </div>
        ) }
      </div>
    </Layout>
  );
};

export default OwnerLaporanPengeluaran;
