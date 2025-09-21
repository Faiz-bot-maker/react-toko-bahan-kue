import React, { useState, useEffect } from 'react';
import { HiOutlineTrendingUp, HiOutlineCurrencyDollar, HiOutlineShoppingBag } from 'react-icons/hi';
import { MdAnalytics } from 'react-icons/md';
import axios from 'axios';
import Layout from '../../components/Layout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const getHeaders = () => ( {
  'Authorization': localStorage.getItem( 'authToken' ),
  'ngrok-skip-browser-warning': 'true',
} );

const formatRupiah = ( angka ) => 'Rp ' + angka.toLocaleString( 'id-ID' );

const OwnerLaporanPenjualan = () => {
  const [ salesData, setSalesData ] = useState( [] );
  const [ loading, setLoading ] = useState( true );
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ totalPages, setTotalPages ] = useState( 1 );
  const [ totalItems, setTotalItems ] = useState( 0 );

  // Filter branch
  const [ branchFilter, setBranchFilter ] = useState( null );
  const [ branchOptions, setBranchOptions ] = useState( [] );

  // Filter tanggal
  const [ dateRange, setDateRange ] = useState( [ null, null ] );
  const [ appliedDateRange, setAppliedDateRange ] = useState( [ null, null ] );
  const [ startDate, endDate ] = dateRange;

  const today = new Date();

  // Ambil daftar cabang
  useEffect( () => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get( `${process.env.REACT_APP_API_URL}/branches`, { headers: getHeaders() } );
        if ( res.data?.data ) setBranchOptions( res.data.data );
      } catch ( err ) {
        console.error( "Gagal mengambil daftar cabang:", err );
      }
    };
    fetchBranches();
  }, [] );

  // Fetch data penjualan
  const fetchSalesData = async ( page = 1 ) => {
    try {
      setLoading( true );
      const params = new URLSearchParams();
      params.append( 'page', page );
      params.append( 'size', 10 );
      if ( branchFilter ) params.append( 'branch_id', branchFilter );
      if ( appliedDateRange[ 0 ] ) params.append( 'start_at', appliedDateRange[ 0 ].toISOString().split( 'T' )[ 0 ] );
      if ( appliedDateRange[ 1 ] ) params.append( 'end_at', appliedDateRange[ 1 ].toISOString().split( 'T' )[ 0 ] );

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales-and-product-reports/daily?${params.toString()}`,
        { headers: getHeaders() }
      );

      const data = response.data?.data || [];
      const paging = response.data?.paging || {};
      setSalesData( data );
      setCurrentPage( paging.page || 1 );
      setTotalPages( paging.total_page || 1 );
      setTotalItems( paging.total_item || 0 );
    } catch ( err ) {
      console.error( 'Gagal mengambil data penjualan:', err );
    } finally {
      setLoading( false );
    }
  };

  useEffect( () => {
    fetchSalesData( currentPage );
  }, [ currentPage, branchFilter, appliedDateRange ] );

  // Summary
  const totalTransactions = salesData.reduce( ( sum, item ) => sum + ( item.total_transactions || 0 ), 0 );
  const totalProductsSold = salesData.reduce( ( sum, item ) => sum + ( item.total_products_sold || 0 ), 0 );
  const totalRevenue = salesData.reduce( ( sum, item ) => sum + ( item.total_revenue || 0 ), 0 );

  const startIndex = ( currentPage - 1 ) * 10;
  const endIndex = Math.min( startIndex + salesData.length, totalItems );

  // Pagination
  const Pagination = () => (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 mt-4">
      <div className="text-xs text-gray-500">
        Menampilkan { totalItems === 0 ? 0 : startIndex + 1 }-{ endIndex } dari total { totalItems } data
      </div>
      <div className="flex items-center gap-2">
        <button onClick={ () => setCurrentPage( 1 ) } disabled={ currentPage === 1 }
          className={ `px-2.5 py-1.5 rounded border ${currentPage === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>«</button>
        <button onClick={ () => setCurrentPage( p => Math.max( 1, p - 1 ) ) } disabled={ currentPage === 1 }
          className={ `px-3 py-1.5 rounded border ${currentPage === 1 ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>Prev</button>
        <span className="text-sm text-gray-700">{ currentPage } / { totalPages }</span>
        <button onClick={ () => setCurrentPage( p => Math.min( totalPages, p + 1 ) ) } disabled={ currentPage === totalPages }
          className={ `px-3 py-1.5 rounded border ${currentPage === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>Next</button>
        <button onClick={ () => setCurrentPage( totalPages ) } disabled={ currentPage === totalPages }
          className={ `px-2.5 py-1.5 rounded border ${currentPage === totalPages ? "text-gray-400 border-gray-200" : "text-gray-700 border-gray-300 hover:bg-gray-50"}` }>»</button>
      </div>
    </div>
  );

  // Reset semua filter
  const resetFilters = () => {
    setBranchFilter( null );
    setDateRange( [ null, null ] );
    setAppliedDateRange( [ null, null ] );
    setCurrentPage( 1 );
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */ }
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MdAnalytics className="text-2xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h1>
              <p className="text-sm text-gray-600">Analisis data penjualan perusahaan</p>
            </div>
          </div>
        </div>

        {/* Summary */ }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
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

        {/* Filter */ }
        <div className="flex mb-6 gap-3 items-end">
          <select
            value={ branchFilter || '' }
            onChange={ e => {
              const val = e.target.value;
              setBranchFilter( val || null );
              setCurrentPage( 1 );
            } }
            className="px-4 py-2 border rounded-lg shadow-sm text-sm focus:ring focus:ring-blue-300 focus:border-blue-500"
          >
            <option value="">Semua Cabang</option>
            { branchOptions.map( branch => (
              <option key={ branch.id } value={ branch.id }>{ branch.name }</option>
            ) ) }
          </select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Tanggal</label>
            <div className="flex gap-2">
              <DatePicker
                selectsRange={ true }
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
                isClearable={ true }
                maxDate={ today }
                dateFormat="dd/MM/yyyy"
                className="border rounded px-3 py-2 text-sm w-60"
                placeholderText="Pilih rentang tanggal"
              />
              <button
                onClick={ resetFilters }
                className="px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */ }
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Cabang</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Total Transaksi</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Produk Terjual</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                { loading ? (
                  <tr>
                    <td colSpan={ 5 } className="px-6 py-6 text-center">Memuat data...</td>
                  </tr>
                ) : salesData.length === 0 ? (
                  <tr>
                    <td colSpan={ 5 } className="px-6 py-12 text-center text-gray-500">Tidak ada data penjualan</td>
                  </tr>
                ) : (
                  salesData.map( ( item, index ) => (
                    <tr key={ index } className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ new Date( item.date ).toLocaleDateString( 'id-ID' ) }</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.branch_name }</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.total_transactions }</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ item.total_products_sold }</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ formatRupiah( item.total_revenue ) }</td>
                    </tr>
                  ) )
                ) }
              </tbody>
            </table>
          </div>
        </div>

        { totalPages > 1 && <Pagination /> }
      </div>
    </Layout>
  );
};

export default OwnerLaporanPenjualan;
