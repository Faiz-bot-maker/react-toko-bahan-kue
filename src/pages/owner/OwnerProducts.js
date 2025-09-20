import React, { useState, useEffect } from 'react';
import { HiOutlinePlus } from 'react-icons/hi';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { TbRulerMeasure } from 'react-icons/tb';
import { MdInventory } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/Layout';

const API_URL = `${process.env.REACT_APP_API_URL}/products`;
const API_CATEGORIES = `${process.env.REACT_APP_API_URL}/categories`;

const getHeaders = () => ( {
  Authorization: localStorage.getItem( 'authToken' ),
  'ngrok-skip-browser-warning': 'true',
} );

const OwnerProducts = () => {
  const [ products, setProducts ] = useState( [] );
  const [ categories, setCategories ] = useState( [] );
  const [ modal, setModal ] = useState( { open: false, mode: null, data: null } );
  const [ newProduct, setNewProduct ] = useState( {
    name: '',
    category_id: '',
    sku: '',
    sizes: [],
  } );
  const [ editValue, setEditValue ] = useState( {
    name: '',
    category_id: '',
    sku: '',
  } );
  const [ loading, setLoading ] = useState( true );

  // 🔎 Search & Pagination
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ totalPages, setTotalPages ] = useState( 1 );
  const [ totalItems, setTotalItems ] = useState( 0 );

  const navigate = useNavigate();

  useEffect( () => {
    fetchProducts( currentPage, searchTerm );
    fetchCategories();
  }, [ currentPage, searchTerm ] );

  const fetchProducts = async ( page = 1, search = '' ) => {
    try {
      setLoading( true );
      const res = await axios.get( API_URL, {
        headers: getHeaders(),
        params: {
          page,
          search,
          exclude_sizes: true,
        },
      } );
      const data = res.data?.data || res.data;
      const paging = res.data?.paging || {};
      setProducts( Array.isArray( data ) ? data : [] );
      setCurrentPage( paging.page || 1 );
      setTotalPages( paging.total_page || 1 );
      setTotalItems( paging.total_item || 0 );
    } catch ( err ) {
      console.error( 'Failed to fetch products:', err );
    } finally {
      setLoading( false );
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get( API_CATEGORIES, { headers: getHeaders() } );
      const data = res.data?.data || res.data;
      if ( Array.isArray( data ) ) setCategories( data );
    } catch ( err ) {
      console.error( 'Failed to fetch categories:', err );
    }
  };

  const handleAddProduct = async () => {
    try {
      const productData = {
        name: newProduct.name,
        category_id: newProduct.category_id,
        sku: `TKAZ-${newProduct.sku}`,
        sizes: [],
      };

      const response = await axios.post( API_URL, productData, { headers: getHeaders() } );
      const createdProduct = response.data.data;

      setNewProduct( { name: '', category_id: '', sku: '', sizes: [] } );
      setModal( { open: false, mode: 'add', data: null } );
      navigate( `/pages/sizeproduct?sku=${createdProduct.sku}` );
    } catch ( err ) {
      console.error( 'Failed to add product:', err.response?.data || err.message );
      alert( 'Gagal menambahkan produk. Pastikan SKU unik dan semua field diisi dengan benar.' );
    }
  };

  const handleEditProduct = async ( sku ) => {
    try {
      const productData = {
        name: editValue.name,
        category_id: editValue.category_id,
        sku: `TKAZ-${editValue.sku}`,
      };

      await axios.put( `${API_URL}/${sku}`, productData, { headers: getHeaders() } );
      setModal( { open: false, mode: 'add', data: null } );
      fetchProducts( currentPage, searchTerm );
    } catch ( err ) {
      console.error( 'Failed to edit product:', err );
      alert( 'Gagal mengedit produk. Periksa kembali data yang dimasukkan.' );
    }
  };

  const handleDeleteProduct = async ( sku ) => {
    if ( window.confirm( 'Yakin ingin menghapus produk ini?' ) ) {
      try {
        await axios.delete( `${API_URL}/${sku}`, { headers: getHeaders() } );
        fetchProducts( currentPage, searchTerm );
      } catch ( err ) {
        console.error( 'Failed to delete product:', err );
        alert( 'Gagal menghapus produk.' );
      }
    }
  };

  const openAdd = () => {
    setModal( { open: true, mode: 'add', data: null } );
    setNewProduct( { name: '', category_id: '', sku: '', sizes: [] } );
  };

  // 📌 Pagination Component
  const Pagination = ( { page, setPage, totalPages, total, perPage } ) => {
    const startIndex = ( page - 1 ) * perPage;
    const endIndex = Math.min( startIndex + perPage, total );

    return (
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Menampilkan { total === 0 ? 0 : startIndex + 1 }-{ endIndex } dari total { total } produk
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={ () => setPage( 1 ) }
            disabled={ page === 1 }
            className={ `px-2.5 py-1.5 rounded border ${page === 1
              ? 'text-gray-400 border-gray-200'
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }` }
          >
            «
          </button>
          <button
            onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) }
            disabled={ page === 1 }
            className={ `px-3 py-1.5 rounded border ${page === 1
              ? 'text-gray-400 border-gray-200'
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
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
              ? 'text-gray-400 border-gray-200'
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }` }
          >
            Next
          </button>
          <button
            onClick={ () => setPage( totalPages ) }
            disabled={ page === totalPages }
            className={ `px-2.5 py-1.5 rounded border ${page === totalPages
              ? 'text-gray-400 border-gray-200'
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }` }
          >
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-lg">
              <MdInventory className="text-2xl text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Data Produk</h1>
              <p className="text-sm text-gray-600">Kelola informasi produk perusahaan</p>
            </div>
          </div>
          <button
            onClick={ openAdd }
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-semibold transition-all duration-200 hover:shadow-xl"
          >
            <HiOutlinePlus className="text-lg" /> Tambah Produk
          </button>
        </div>

        {/* 🔎 Search Input */ }
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari produk atau SKU..."
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm text-sm focus:ring focus:ring-green-300 focus:border-green-500"
            value={ searchTerm }
            onChange={ ( e ) => {
              setSearchTerm( e.target.value );
              setCurrentPage( 1 );
            } }
          />
        </div>

        {/* Table Section */ }
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Nama Produk</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-left font-semibold text-xs uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-right font-semibold text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                { loading ? (
                  <tr>
                    <td colSpan={ 4 } className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        <span className="ml-3 text-gray-600 text-sm">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={ 4 } className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <MdInventory className="text-6xl text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data produk</h3>
                        <p className="text-gray-500 mb-4 text-sm">Mulai dengan menambahkan produk pertama Anda</p>
                        <button
                          onClick={ openAdd }
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                        >
                          <HiOutlinePlus className="text-base" /> Tambah Produk Pertama
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map( ( product ) => (
                    <tr key={ product.sku } className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-sm">{ product.name }</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 text-sm">{ product.category?.name || '-' }</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-mono text-sm">{ product.sku }</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={ `/pages/sizeproduct?sku=${product.sku}` }
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Kelola Ukuran"
                          >
                            <TbRulerMeasure size={ 18 } />
                          </Link>
                          <button
                            onClick={ () => {
                              setModal( { open: true, mode: 'edit', data: product } );
                              setEditValue( {
                                name: product.name,
                                category_id: product.category?.id || '',
                                sku: product.sku.replace( 'TKAZ-', '' ),
                              } );
                            } }
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <FiEdit size={ 18 } />
                          </button>
                          <button
                            onClick={ () => handleDeleteProduct( product.sku ) }
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <FiTrash size={ 18 } />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) )
                ) }
              </tbody>
            </table>
          </div>
          {/* 📌 Pagination */ }
          { totalPages > 1 && (
            <Pagination
              page={ currentPage }
              setPage={ setCurrentPage }
              totalPages={ totalPages }
              total={ totalItems }
              perPage={ products.length }
            />
          ) }
        </div>

        {/* Add/Edit Product Modal */ }
        { modal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <MdInventory className="text-xl text-teal-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    { modal.mode === 'add' ? 'Tambah' : 'Edit' } Produk
                  </h2>
                </div>

                {/* Product Form */ }
                <div className="space-y-6">
                  {/* Name Field */ }
                  <div>
                    <label className="block text sm font-semibold text-gray-700 mb-2">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
                      placeholder="Masukkan nama produk"
                      value={ modal.mode === 'add' ? newProduct.name : editValue.name }
                      onChange={ ( e ) =>
                        modal.mode === 'add'
                          ? setNewProduct( { ...newProduct, name: e.target.value } )
                          : setEditValue( { ...editValue, name: e.target.value } )
                      }
                      required
                    />
                  </div>

                  {/* Category Field */ }
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
                      value={ modal.mode === 'add' ? newProduct.category_id : editValue.category_id }
                      onChange={ ( e ) =>
                        modal.mode === 'add'
                          ? setNewProduct( { ...newProduct, category_id: parseInt( e.target.value, 10 ) } )
                          : setEditValue( { ...editValue, category_id: parseInt( e.target.value, 10 ) } )
                      }
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      { categories.map( ( category ) => (
                        <option key={ category.id } value={ category.id }>
                          { category.name }
                        </option>
                      ) ) }
                    </select>
                  </div>

                  {/* SKU Field */ }
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SKU
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                        TKAZ-
                      </span>
                      <input
                        type="text"
                        className="pl-12 w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm transition-colors"
                        placeholder="Masukkan nomor SKU"
                        value={ modal.mode === 'add' ? newProduct.sku : editValue.sku }
                        onChange={ ( e ) =>
                          modal.mode === 'add'
                            ? setNewProduct( { ...newProduct, sku: e.target.value } )
                            : setEditValue( { ...editValue, sku: e.target.value } )
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */ }
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={ () => setModal( { open: false, mode: 'add', data: null } ) }
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={ modal.mode === 'add' ? handleAddProduct : () => handleEditProduct( modal.data.sku ) }
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    { modal.mode === 'add' ? 'Tambah Produk' : 'Simpan Perubahan' }
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) }
      </div>
    </Layout>
  );
};

export default OwnerProducts;