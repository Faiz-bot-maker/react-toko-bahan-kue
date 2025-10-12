import React, { useState, useEffect } from "react";
import {
    HiOutlineOfficeBuilding,
    HiOutlineEye,
    HiOutlineX,
    HiOutlinePlus,
} from "react-icons/hi";
import { FiEdit, FiTrash } from "react-icons/fi";
import axios from "axios";
import Layout from "../../components/Layout";

const API_URL = `${process.env.REACT_APP_API_URL}/branch-inventory`;
const API_PRODUCTS = `${process.env.REACT_APP_API_URL}/products`;
const API_BRANCHES = `${process.env.REACT_APP_API_URL}/branches`;

const getHeaders = () => ( {
    Authorization: localStorage.getItem( "authToken" ),
    "ngrok-skip-browser-warning": "true",
} );

const OwnerInventory = () => {
    const [ inventories, setInventories ] = useState( [] );
    const [ loading, setLoading ] = useState( true );

    // Modal state
    const [ showModal, setShowModal ] = useState( false );
    const [ sizes, setSizes ] = useState( [] );
    const [ loadingSizes, setLoadingSizes ] = useState( false );

    // CRUD Modal
    const [ crudModal, setCrudModal ] = useState( { open: false, mode: "add", data: null } );
    const [ formData, setFormData ] = useState( {
        product_sku: "",
        sku: "",
        branch_id: "",
        sell_price: "",
        size_id: "",
    } );

    // Data untuk filter & dropdown
    const [ searchTerm, setSearchTerm ] = useState( "" );
    const [ branchFilter, setBranchFilter ] = useState( null );
    const [ currentPage, setCurrentPage ] = useState( 1 );
    const [ totalPages, setTotalPages ] = useState( 1 );
    const [ totalItems, setTotalItems ] = useState( 0 );

    const [ branchOptions, setBranchOptions ] = useState( [] );
    const [ productOptions, setProductOptions ] = useState( [] );
    const [ sizeOptions, setSizeOptions ] = useState( [] );

    // Fetch Branches
    const fetchBranches = async () => {
        try {
            const res = await axios.get( API_BRANCHES, { headers: getHeaders() } );
            if ( res.data?.data ) setBranchOptions( res.data.data );
        } catch ( err ) {
            console.error( "Failed to fetch branches:", err );
        }
    };

    // Fetch Products
    const fetchProducts = async () => {
        try {
            const res = await axios.get( API_PRODUCTS, {
                headers: getHeaders(),
                params: { exclude_sizes: true },
            } );
            if ( Array.isArray( res.data?.data ) ) setProductOptions( res.data.data );
        } catch ( err ) {
            console.error( "Failed to fetch products:", err );
        }
    };

    // Fetch Inventories
    const fetchInventories = async ( page = 1, branch = null, search = "" ) => {
        try {
            setLoading( true );
            const params = new URLSearchParams();
            params.append( "page", page );
            if ( branch ) params.append( "branch_id", branch );
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

    // Fetch Sizes (API /products/{sku}/sizes)
    const fetchSizes = async ( sizes ) => {
        try {
            setLoadingSizes( true );
            setShowModal( true );

            if ( Array.isArray( sizes ) ) {
                setSizes( sizes );
            } else {
                setSizes( [] );
            }
        } catch ( err ) {
            console.error( "Failed to fetch sizes:", err );
            setSizes( [] );
        } finally {
            setLoadingSizes( false );
        }
    };

    // Fetch Sizes untuk CRUD (dropdown)
    const fetchProductSizes = async ( sku ) => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/products/${sku}/sizes`,
                { headers: getHeaders() }
            );
            if ( Array.isArray( res.data?.data ) ) {
                setSizeOptions( res.data.data );
            } else {
                setSizeOptions( [] );
            }
        } catch ( err ) {
            console.error( "Failed to fetch product sizes:", err );
            setSizeOptions( [] );
        }
    };

    // CRUD Handlers
    const handleAdd = async () => {
        try {
            await axios.post( API_URL, formData, { headers: getHeaders() } );
            setCrudModal( { open: false, mode: "add", data: null } );
            fetchInventories( currentPage, branchFilter, searchTerm );
        } catch ( err ) {
            console.error( "Failed to add inventory:", err );
            alert( "Gagal menambah data inventory" );
        }
    };

    const handleEdit = async ( id ) => {
        try {
            await axios.put( `${API_URL}/${id}`, formData, { headers: getHeaders() } );
            setCrudModal( { open: false, mode: "edit", data: null } );
            fetchInventories( currentPage, branchFilter, searchTerm );
        } catch ( err ) {
            console.error( "Failed to edit inventory:", err );
            alert( "Gagal mengubah data inventory" );
        }
    };

    const handleDelete = async ( id ) => {
        if ( window.confirm( "Yakin ingin menghapus data ini?" ) ) {
            try {
                await axios.delete( `${API_URL}/${id}`, { headers: getHeaders() } );
                fetchInventories( currentPage, branchFilter, searchTerm );
            } catch ( err ) {
                console.error( "Failed to delete inventory:", err );
                alert( "Gagal menghapus data" );
            }
        }
    };

    // Lifecycle
    useEffect( () => {
        fetchBranches();
        fetchProducts();
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

    // Hitung startIndex & endIndex
    const pageSize = inventories.length || 0;
    const startIndex = ( currentPage - 1 ) * pageSize;
    const endIndex = Math.min( startIndex + pageSize, totalItems );

    return (
        <Layout>
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */ }
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <HiOutlineOfficeBuilding className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Inventory Semua Cabang</h1>
                            <p className="text-sm text-gray-600">Lihat & Kelola data inventory cabang</p>
                        </div>
                    </div>
                    <button
                        onClick={ () => {
                            setCrudModal( { open: true, mode: "add", data: null } );
                            setFormData( { product_sku: "", sku: "", branch_id: "", sell_price: "", size_id: "" } );
                            setSizeOptions( [] );
                        } }
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all"
                    >
                        <HiOutlinePlus className="text-lg" /> Tambah Inventory
                    </button>
                </div>

                {/* Search & Filter */ }
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-end gap-4">
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
                                                <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : inventories.length === 0 ? (
                                    <tr>
                                        <td colSpan={ 4 } className="px-6 py-16 text-center">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Tidak ada data ditemukan
                                            </h3>
                                        </td>
                                    </tr>
                                ) : (
                                    inventories.map( ( item ) => (
                                        <tr key={ `${item.branch_id}-${item.sku}` } className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                { item.branch_name }
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">{ item.name }</td>
                                            <td className="px-6 py-4 text-gray-600">{ item.sku }</td>
                                            <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                                <button
                                                    onClick={ () => fetchSizes( item.sizes ) }
                                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg"
                                                    title="Lihat Ukuran"
                                                >
                                                    <HiOutlineEye size={ 18 } />
                                                </button>
                                                <button
                                                    onClick={ () => {
                                                        setCrudModal( { open: true, mode: "edit", data: item } );
                                                        setFormData( {
                                                            product_sku: item.product_sku,
                                                            sku: item.sku,
                                                            branch_id: item.branch_id,
                                                            sell_price: item.sell_price,
                                                            size_id: item.size_id || "",
                                                        } );
                                                        fetchProductSizes( item.sku );
                                                    } }
                                                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <FiEdit size={ 18 } />
                                                </button>
                                                <button
                                                    onClick={ () => handleDelete( item.id ) }
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                    title="Hapus"
                                                >
                                                    <FiTrash size={ 18 } />
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

                {/* CRUD Modal */ }
                { crudModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                            <button
                                onClick={ () => setCrudModal( { open: false, mode: "add", data: null } ) }
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <HiOutlineX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-6">
                                { crudModal.mode === "add" ? "Tambah" : "Edit" } Inventory
                            </h2>

                            <div className="space-y-4">
                                {/* Product */ }
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Produk
                                    </label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={ formData.product_sku }
                                        onChange={ ( e ) => {
                                            const product = productOptions.find(
                                                ( p ) => p.sku === e.target.value
                                            );
                                            if ( product ) {
                                                setFormData( {
                                                    ...formData,
                                                    product_sku: product.sku,
                                                    sku: product.sku,
                                                    size_id: "",
                                                } );
                                                fetchProductSizes( product.sku );
                                            }
                                        } }
                                    >
                                        <option value="">Pilih Produk</option>
                                        { productOptions.map( ( p ) => (
                                            <option key={ p.sku } value={ p.sku }>
                                                { p.name }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>

                                {/* SKU */ }
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                                    <input
                                        type="text"
                                        value={ formData.sku }
                                        disabled
                                        className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                                    />
                                </div>

                                {/* Size */ }
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={ formData.size_id }
                                        onChange={ ( e ) => setFormData( { ...formData, size_id: e.target.value } ) }
                                        disabled={ sizeOptions.length === 0 }
                                    >
                                        <option value="">Pilih Ukuran</option>
                                        { sizeOptions.map( ( s ) => (
                                            <option key={ s.id } value={ s.id }>
                                                { s.name }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>

                                {/* Branch */ }
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cabang</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={ formData.branch_id }
                                        onChange={ ( e ) => setFormData( { ...formData, branch_id: e.target.value } ) }
                                    >
                                        <option value="">Pilih Cabang</option>
                                        { branchOptions.map( ( b ) => (
                                            <option key={ b.id } value={ b.id }>
                                                { b.name }
                                            </option>
                                        ) ) }
                                    </select>
                                </div>

                                {/* Sell Price */ }
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Harga Jual
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={ formData.sell_price }
                                        onChange={ ( e ) =>
                                            setFormData( { ...formData, sell_price: e.target.value } )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Actions */ }
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={ () => setCrudModal( { open: false, mode: "add", data: null } ) }
                                    className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={ () =>
                                        crudModal.mode === "add"
                                            ? handleAdd()
                                            : handleEdit( crudModal.data.id )
                                    }
                                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                                >
                                    { crudModal.mode === "add" ? "Tambah" : "Simpan" }
                                </button>
                            </div>
                        </div>
                    </div>
                ) }

                {/* Size Modal */ }
                { showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                            <button
                                onClick={ () => setShowModal( false ) }
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <HiOutlineX className="w-6 h-6" />
                            </button>

                            <h2 className="text-xl font-bold mb-6">Daftar Ukuran</h2>

                            { loadingSizes ? (
                                <div className="text-center py-10 text-gray-500">Memuat ukuran...</div>
                            ) : sizes.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    Tidak ada ukuran tersedia
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    { sizes.map( ( size ) => (
                                        <li
                                            key={ size.size_id }
                                            className="p-3 border rounded-lg hover:bg-gray-50 flex justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">Size: { size.size }</p>
                                                <p className="text-sm text-gray-500">Stok: { size.stock }</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-green-600 font-semibold">
                                                    Rp { Number( size.sell_price ).toLocaleString( "id-ID" ) }
                                                </p>
                                            </div>
                                        </li>
                                    ) ) }
                                </ul>
                            ) }
                        </div>
                    </div>
                ) }
            </div>
        </Layout>
    );
};

export default OwnerInventory;
