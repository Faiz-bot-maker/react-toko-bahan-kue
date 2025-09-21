import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding, HiOutlineEye, HiOutlineX } from "react-icons/hi";
import axios from "axios";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/branch-inventory`;

const getHeaders = () => ( {
    Authorization: localStorage.getItem( "authToken" ),
    "ngrok-skip-browser-warning": "true",
} );

const OwnerInventory = () => {
    const [ inventories, setInventories ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    const [ showModal, setShowModal ] = useState( false );
    const [ selectedProduct, setSelectedProduct ] = useState( null );
    const [ sizes, setSizes ] = useState( [] );
    const [ loadingSizes, setLoadingSizes ] = useState( false );

    const [ searchTerm, setSearchTerm ] = useState( "" );
    const [ branchFilter, setBranchFilter ] = useState( null );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ branchOptions, setBranchOptions ] = useState( [] );

    // Fetch branch options
    const fetchBranches = async () => {
        try {
            const res = await axios.get( `${process.env.REACT_APP_API_URL}/branches`, {
                headers: getHeaders(),
            } );
            if ( res.data?.data ) {
                setBranchOptions( res.data.data );
            }
        } catch ( err ) {
            console.error( "Failed to fetch branches:", err );
        }
    };

    // Fetch inventories
    const fetchInventories = async ( page = 1, branch = null, search = "" ) => {
        try {
            setLoading( true );

            const params = new URLSearchParams();
            params.append( "page", page );
            if ( branch !== null ) params.append( "branch_id", branch );
            if ( search ) params.append( "search", search );

            const res = await axios.get( `${API_URL}?${params.toString()}`, {
                headers: getHeaders(),
            } );

            const data = res.data?.data || [];
            const paging = res.data?.paging || {};

            setInventories( data );
            setCurrentPage( paging.page || 1 );
            setTotalPages( paging.total_page || 1 );
            setTotalItems( paging.total_item || 0 );
        } catch ( err ) {
            console.error( "Failed to fetch inventories:", err );
        } finally {
            setLoading( false );
        }
    };

    const fetchSizes = async ( sku, name, branch, sizes ) => {
        setLoadingSizes( true );
        setSelectedProduct( { sku, name, branch } );
        setShowModal( true );
        setSizes( sizes || [] );
        setLoadingSizes( false );
    };

    useEffect( () => {
        fetchBranches();
    }, [] );

    useEffect( () => {
        fetchInventories( currentPage, branchFilter, searchTerm );
    }, [ currentPage, branchFilter, searchTerm ] );

    // Pagination component
    const Pagination = ( { page, setPage, totalPages, startIndex, endIndex, total } ) => (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
                Menampilkan { total === 0 ? 0 : startIndex + 1 }-{ endIndex } dari total { total } data
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

    // Hitung startIndex & endIndex berdasarkan paging API
    const pageSize = inventories.length || 0;
    const startIndex = ( currentPage - 1 ) * pageSize;
    const endIndex = Math.min( startIndex + pageSize, totalItems );

    return (
        <Layout>
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */ }
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <HiOutlineOfficeBuilding className="text-2xl text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Inventory Semua Cabang
                        </h1>
                        <p className="text-sm text-gray-600">
                            Lihat daftar produk di semua cabang
                        </p>
                    </div>
                </div>

                {/* Search & Filter */ }
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Cari produk, SKU, atau cabang..."
                        className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm text-sm focus:ring focus:ring-green-300 focus:border-green-500"
                        value={ searchTerm }
                        onChange={ ( e ) => {
                            setSearchTerm( e.target.value );
                            setCurrentPage( 1 );
                        } }
                    />
                    <select
                        value={ branchFilter || "" }
                        onChange={ ( e ) => {
                            setBranchFilter( e.target.value );
                            setCurrentPage( 1 );
                        } }
                        className="w-full md:w-1/4 px-4 py-2 border rounded-lg shadow-sm text-sm focus:ring focus:ring-green-300 focus:border-green-500"
                    >
                        <option value="">Semua Cabang</option>
                        { branchOptions.map( ( branch ) => (
                            <option key={ branch.id } value={ branch.id }>
                                { branch.name }
                            </option>
                        ) ) }
                    </select>
                </div>

                {/* Table */ }
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Cabang
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        Nama Barang
                                    </th>
                                    <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                                        SKU
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                                        Aksi
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
                                ) : inventories.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 4 } className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <HiOutlineOfficeBuilding className="text-6xl text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Tidak ada data ditemukan
                                                </h3>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    inventories.map( ( item ) => (
                                        <tr
                                            key={ `${item.branch_id}-${item.sku}` }
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                { item.branch_name }
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                { item.name }
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{ item.sku }</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={ () =>
                                                        fetchSizes(
                                                            item.sku,
                                                            item.name,
                                                            item.branch_name,
                                                            item.sizes
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <HiOutlineEye className="text-lg" />
                                                    Lihat Ukuran
                                                </button>
                                            </td>
                                        </tr>
                                    ) )
                                ) }
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
                        startIndex={ startIndex }
                        endIndex={ endIndex }
                        total={ totalItems }
                    />
                ) }

                {/* Modal Sizes */ }
                { showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
                            <button
                                onClick={ () => setShowModal( false ) }
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <HiOutlineX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-4 text-gray-800">
                                Ukuran Produk – { selectedProduct?.name } ({ selectedProduct?.sku })
                                <span className="block text-sm text-gray-500">
                                    Cabang: { selectedProduct?.branch }
                                </span>
                            </h2>

                            { loadingSizes ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    <span className="ml-3 text-gray-600 text-sm">
                                        Memuat ukuran...
                                    </span>
                                </div>
                            ) : sizes.length === 0 ? (
                                <p className="text-center text-gray-500 py-12">
                                    Tidak ada ukuran untuk produk ini
                                </p>
                            ) : (
                                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                                                Ukuran
                                            </th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                                                Stok
                                            </th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                                                Harga Jual
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { sizes.map( ( s ) => (
                                            <tr key={ s.size_id } className="border-t">
                                                <td className="px-4 py-2 text-gray-800">{ s.size }</td>
                                                <td className="px-4 py-2 text-gray-600">{ s.stock }</td>
                                                <td className="px-4 py-2 text-gray-600">
                                                    Rp { s.sell_price.toLocaleString( "id-ID" ) }
                                                </td>
                                            </tr>
                                        ) ) }
                                    </tbody>
                                </table>
                            ) }
                        </div>
                    </div>
                ) }
            </div>
        </Layout>
    );
};

export default OwnerInventory;
