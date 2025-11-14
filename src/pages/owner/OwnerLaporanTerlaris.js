// import React, { useState, useEffect } from 'react';
// // import Sidebar from '../components/Sidebar';
// // import Header from '../components/Header';
// import Layout from '../components/Layout';
// import { HiOutlineStar, HiOutlineTrendingUp, HiOutlineCube } from 'react-icons/hi';
// import { MdTrendingUp, MdCategory } from 'react-icons/md';
// import axios from 'axios';

// const getHeaders = () => ({
//   Authorization: localStorage.getItem('authToken'),
//   'ngrok-skip-browser-warning': 'true',
// });

// const formatRupiah = (angka) => 'Rp ' + angka.toLocaleString('id-ID');

// const LaporanTerlaris = () => {
//   const [bestSellers, setBestSellers] = useState([]);
//   const [loadingProducts, setLoadingProducts] = useState(true);

//   const [categoryData, setCategoryData] = useState([]);
//   const [loadingCategories, setLoadingCategories] = useState(true);

//   // Pagination state
//   const [productPage, setProductPage] = useState(1);
//   const [categoryPage, setCategoryPage] = useState(1);
//   const pageSize = 5;

//   useEffect(() => {
//     fetchAll();
//   }, []);

//   useEffect(() => {
//     setProductPage(1);
//   }, [bestSellers]);

//   useEffect(() => {
//     setCategoryPage(1);
//   }, [categoryData]);

//   const fetchAll = async () => {
//     await Promise.all([fetchBestSellers(), fetchCategoryReport()]);
//   };

//   const fetchBestSellers = async () => {
//     try {
//       setLoadingProducts(true);
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/sales-reports/top-seller`, { 
//         headers: getHeaders() 
//       });
//       const data = response.data?.data || [];
//       setBestSellers(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Gagal mengambil data produk terlaris:', err);
//     } finally {
//       setLoadingProducts(false);
//     }
//   };

//   const fetchCategoryReport = async () => {
//     try {
//       setLoadingCategories(true);
//       const response = await axios.get(`${process.env.REACT_APP_API_URL}/sales-and-product-reports/categories`, { 
//         headers: getHeaders() 
//       });
//       const data = response.data?.data || [];
//       setCategoryData(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Gagal mengambil data laporan kategori:', err);
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   // Derived pagination values (Products)
//   const productTotalPages = Math.max(1, Math.ceil(bestSellers.length / pageSize));
//   const productStartIndex = (productPage - 1) * pageSize;
//   const productEndIndex = Math.min(productStartIndex + pageSize, bestSellers.length);
//   const bestSellersPage = bestSellers.slice(productStartIndex, productStartIndex + pageSize);

//   // Derived pagination values (Categories)
//   const categoryTotalPages = Math.max(1, Math.ceil(categoryData.length / pageSize));
//   const categoryStartIndex = (categoryPage - 1) * pageSize;
//   const categoryEndIndex = Math.min(categoryStartIndex + pageSize, categoryData.length);
//   const categoryPageData = categoryData.slice(categoryStartIndex, categoryStartIndex + pageSize);

//   const Pagination = ({ total, page, setPage, startIndex, endIndex, totalPages }) => (
//     <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
//       <div className="text-xs text-gray-500">
//         Menampilkan {total === 0 ? 0 : startIndex + 1}-{endIndex} dari total {total} data
//       </div>
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => setPage(1)}
//           disabled={page === 1}
//           className={`px-2.5 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
//         >
//           «
//         </button>
//         <button
//           onClick={() => setPage((p) => Math.max(1, p - 1))}
//           disabled={page === 1}
//           className={`px-3 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
//         >
//           Prev
//         </button>
//         <span className="text-sm text-gray-700">Halaman {page} / {totalPages}</span>
//         <button
//           onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//           disabled={page === totalPages}
//           className={`px-3 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
//         >
//           Next
//         </button>
//         <button
//           onClick={() => setPage(totalPages)}
//           disabled={page === totalPages}
//           className={`px-2.5 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
//         >
//           »
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <Layout>
//           <div className="w-full max-w-7xl mx-auto">
//             {/* Header Section (Kategori Terlaris) */}
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="p-3 bg-purple-100 rounded-lg">
//                   <MdCategory className="text-2xl text-purple-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800">Kategori Terlaris</h1>
//                   <p className="text-sm text-gray-600">Analisis penjualan berdasarkan kategori produk</p>
//                 </div>
//               </div>
//               <div className="text-xs text-gray-500">
//                 {!loadingCategories && categoryData.length > 0 && `Total: ${categoryData.length} kategori`}
//               </div>
//             </div>

//             {/* Kategori Terlaris - Table Section */}
//             <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden mb-10">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
//                     <tr>
//                       <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">
//                         Ranking
//                       </th>
//                       <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">
//                         Kategori
//                       </th>
//                       <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">
//                         Total Terjual
//                       </th>
//                       <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">
//                         Omset
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {loadingCategories ? (
//                       <tr>
//                         <td colSpan={4} className="px-6 py-6">
//                           <div className="animate-pulse space-y-3">
//                             {[...Array(6)].map((_, i) => (
//                               <div key={i} className="grid grid-cols-4 gap-4">
//                                 <div className="h-4 bg-gray-200 rounded"></div>
//                                 <div className="h-4 bg-gray-200 rounded"></div>
//                                 <div className="h-4 bg-gray-200 rounded"></div>
//                                 <div className="h-4 bg-gray-200 rounded"></div>
//                               </div>
//                             ))}
//                           </div>
//                         </td>
//                       </tr>
//                     ) : categoryData.length === 0 ? (
//                       <tr>
//                         <td colSpan={4} className="px-6 py-16 text-center">
//                           <div className="flex flex-col items-center">
//                             <MdCategory className="text-6xl text-gray-300 mb-4" />
//                             <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data laporan kategori</h3>
//                             <p className="text-gray-500">Data akan muncul setelah ada transaksi penjualan</p>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       categoryPageData.map((category, index) => {
//                         const rank = categoryStartIndex + index + 1;
//                         return (
//                           <tr key={index} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-3">
//                               <div className="flex items-center">
//                                 <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${rank === 1 ? 'bg-yellow-100 text-yellow-800' :
//                                   rank === 2 ? 'bg-gray-100 text-gray-800' :
//                                     rank === 3 ? 'bg-orange-100 text-orange-800' :
//                                       'bg-blue-100 text-blue-800'
//                                   }`}>
//                                   {rank}
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-3">
//                               <div className="flex items-center">
//                                 <div className="flex-shrink-0 h-10 w-10">
//                                   <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
//                                     <HiOutlineCube className="h-6 w-6 text-gray-500" />
//                                   </div>
//                                 </div>
//                                 <div className="ml-4">
//                                   <div className="text-sm font-medium text-gray-900">
//                                     {category.category_name}
//                                   </div>
//                                   <div className="text-xs text-gray-500">
//                                     ID: {category.category_id}
//                                   </div>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-3 text-sm text-gray-700 text-right">{category.total_qty}</td>
//                             <td className="px-6 py-3 text-sm text-gray-700 text-right">{formatRupiah(category.total_omzet)}</td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//               {!loadingCategories && categoryData.length > pageSize && (
//                 <Pagination
//                   total={categoryData.length}
//                   page={categoryPage}
//                   setPage={setCategoryPage}
//                   startIndex={categoryStartIndex}
//                   endIndex={categoryEndIndex}
//                   totalPages={categoryTotalPages}
//                 />
//               )}
//             </div>

//             {/* Header Section (Produk Terlaris) */}
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center gap-3">
//                 <div className="p-3 bg-yellow-100 rounded-lg">
//                   <MdTrendingUp className="text-2xl text-yellow-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">Produk Terlaris</h2>
//                   <p className="text-sm text-gray-600">Analisis produk dengan penjualan tertinggi</p>
//                 </div>
//               </div>
//               <div className="text-xs text-gray-500">
//                 {!loadingProducts && bestSellers.length > 0 && `Total: ${bestSellers.length} produk`}
//               </div>
//             </div>

//             {/* Produk Terlaris - Table Section */}
//             <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
//                     <tr>
//                       <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">
//                         Ranking
//                       </th>
//                       <th className="px-6 py-3 text-left font-semibold text-xs uppercase tracking-wider">
//                         Produk
//                       </th>
//                       <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">
//                         Total Terjual
//                       </th>
//                       <th className="px-6 py-3 text-right font-semibold text-xs uppercase tracking-wider">
//                         Omset
//                         </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {loadingProducts ? (
//                       <tr>
//                         <td colSpan={4} className="px-6 py-12 text-center">
//                           <div className="flex items-center justify-center">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
//                             <span className="ml-3 text-gray-600">Memuat data...</span>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : bestSellers.length === 0 ? (
//                       <tr>
//                         <td colSpan={4} className="px-6 py-16 text-center">
//                           <div className="flex flex-col items-center">
//                             <MdTrendingUp className="text-6xl text-gray-300 mb-4" />
//                             <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data produk terlaris</h3>
//                             <p className="text-gray-500">Data akan muncul setelah ada transaksi penjualan</p>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : (
//                       bestSellersPage.map((product, index) => {
//                         const rank = productStartIndex + index + 1;
//                         return (
//                           <tr key={index} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-3">
//                               <div className="flex items-center">
//                                 <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${rank === 1 ? 'bg-yellow-100 text-yellow-800' :
//                                   rank === 2 ? 'bg-gray-100 text-gray-800' :
//                                     rank === 3 ? 'bg-orange-100 text-orange-800' :
//                                       'bg-blue-100 text-blue-800'
//                                   }`}>
//                                   {rank}
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-3">
//                               <div className="flex items-center">
//                                 <div className="flex-shrink-0 h-10 w-10">
//                                   <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
//                                     <HiOutlineCube className="h-6 w-6 text-gray-500" />
//                                   </div>
//                                 </div>
//                                 <div className="ml-4">
//                                   <div className="text-sm font-medium text-gray-900">
//                                     {product.product_name}
//                                   </div>
//                                   <div className="text-xs text-gray-500">
//                                     SKU: {product.product_sku}
//                                   </div>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-3 text-sm text-gray-700 text-right">{product.total_qty}</td>
//                             <td className="px-6 py-3 text-sm text-gray-700 text-right">{formatRupiah(product.total_omzet)}</td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//               {!loadingProducts && bestSellers.length > pageSize && (
//                 <Pagination
//                   total={bestSellers.length}
//                   page={productPage}
//                   setPage={setProductPage}
//                   startIndex={productStartIndex}
//                   endIndex={productEndIndex}
//                   totalPages={productTotalPages}
//                 />
//               )}
//             </div>
//           </div>
//     </Layout>
//   );
// };

// export default LaporanTerlaris;


import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
import Layout from '../../components/Layout';
import { HiOutlineStar, HiOutlineTrendingUp, HiOutlineCube } from 'react-icons/hi';
import { MdTrendingUp, MdCategory } from 'react-icons/md';
import axios from 'axios';

const getHeaders = () => ( {
  Authorization: localStorage.getItem( 'authToken' ),
  'ngrok-skip-browser-warning': 'true',
} );

const formatRupiah = ( angka ) => 'Rp ' + angka.toLocaleString( 'id-ID' );

const OwnerLaporanTerlaris = () => {
  const [ bestSellers, setBestSellers ] = useState( [] );
  const [ loadingProducts, setLoadingProducts ] = useState( true );

  const [ categoryData, setCategoryData ] = useState( [] );
  const [ loadingCategories, setLoadingCategories ] = useState( true );

  // Pagination
  const [ productPage, setProductPage ] = useState( 1 );
  const [ categoryPage, setCategoryPage ] = useState( 1 );
  const pageSize = 5;

  // Tab
  const [ activeTab, setActiveTab ] = useState( 'category' ); // 'category' or 'product'

  useEffect( () => {
    fetchAll();
  }, [] );

  useEffect( () => {
    setProductPage( 1 );
  }, [ bestSellers ] );

  useEffect( () => {
    setCategoryPage( 1 );
  }, [ categoryData ] );

  const fetchAll = async () => {
    await Promise.all( [ fetchBestSellers(), fetchCategoryReport() ] );
  };

  const fetchBestSellers = async () => {
    try {
      setLoadingProducts( true );
      const response = await axios.get( `${process.env.REACT_APP_API_URL}/sales-reports/top-seller-products`, {
        headers: getHeaders()
      } );
      const data = response.data?.data || [];
      setBestSellers( Array.isArray( data ) ? data : [] );
    } catch ( err ) {
      console.error( 'Gagal mengambil data produk terlaris:', err );
    } finally {
      setLoadingProducts( false );
    }
  };

  const fetchCategoryReport = async () => {
    try {
      setLoadingCategories( true );
      const response = await axios.get( `${process.env.REACT_APP_API_URL}/sales-reports/top-seller-categories`, {
        headers: getHeaders()
      } );
      const data = response.data?.data || [];
      setCategoryData( Array.isArray( data ) ? data : [] );
    } catch ( err ) {
      console.error( 'Gagal mengambil data laporan kategori:', err );
    } finally {
      setLoadingCategories( false );
    }
  };

  // pagination (Products)
  const productTotalPages = Math.max( 1, Math.ceil( bestSellers.length / pageSize ) );
  const productStartIndex = ( productPage - 1 ) * pageSize;
  const productEndIndex = Math.min( productStartIndex + pageSize, bestSellers.length );
  const bestSellersPage = bestSellers.slice( productStartIndex, productStartIndex + pageSize );

  // Pagination (Categories)
  const categoryTotalPages = Math.max( 1, Math.ceil( categoryData.length / pageSize ) );
  const categoryStartIndex = ( categoryPage - 1 ) * pageSize;
  const categoryEndIndex = Math.min( categoryStartIndex + pageSize, categoryData.length );
  const categoryPageData = categoryData.slice( categoryStartIndex, categoryStartIndex + pageSize );

  const Pagination = ( { total, page, setPage, startIndex, endIndex, totalPages } ) => (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
      <div className="text-xs text-gray-500">
        Menampilkan { total === 0 ? 0 : startIndex + 1 }-{ endIndex } dari total { total } data
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={ () => setPage( 1 ) }
          disabled={ page === 1 }
          className={ `px-2.5 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
        >
          «
        </button>
        <button
          onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) }
          disabled={ page === 1 }
          className={ `px-3 py-1.5 rounded border ${page === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">Halaman { page } / { totalPages }</span>
        <button
          onClick={ () => setPage( ( p ) => Math.min( totalPages, p + 1 ) ) }
          disabled={ page === totalPages }
          className={ `px-3 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
        >
          Next
        </button>
        <button
          onClick={ () => setPage( totalPages ) }
          disabled={ page === totalPages }
          className={ `px-2.5 py-1.5 rounded border ${page === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}` }
        >
          »
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Main Header */ }
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
              <HiOutlineTrendingUp className="text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Laporan Terlaris</h1>
              {/* <p className="text-gray-600">Analisis produk dan kategori dengan penjualan tertinggi</p> */ }
            </div>
          </div>
        </div>

        {/* Tab Buttons */ }
        <div className="flex space-x-2 bg-gray-50 p-2 rounded-2xl mb-8 shadow-sm">
          <button
            onClick={ () => setActiveTab( 'category' ) }
            className={ `flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === 'category'
              ? 'bg-white text-purple-700 shadow-md border border-purple-100'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }` }
          >
            <div className={ `p-2 rounded-lg ${activeTab === 'category' ? 'bg-purple-100' : 'bg-gray-100'}` }>
              <MdCategory className={ `text-lg ${activeTab === 'category' ? 'text-purple-600' : 'text-gray-500'}` } />
            </div>
            <span className="font-semibold">Kategori Terlaris</span>
            { !loadingCategories && categoryData.length > 0 && (
              <span className={ `px-2.5 py-1 rounded-full text-xs font-medium ${activeTab === 'category' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'
                }` }>
                { categoryData.length }
              </span>
            ) }
          </button>
          <button
            onClick={ () => setActiveTab( 'product' ) }
            className={ `flex items-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 ${activeTab === 'product'
              ? 'bg-white text-yellow-700 shadow-md border border-yellow-100'
              : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }` }
          >
            <div className={ `p-2 rounded-lg ${activeTab === 'product' ? 'bg-yellow-100' : 'bg-gray-100'}` }>
              <MdTrendingUp className={ `text-lg ${activeTab === 'product' ? 'text-yellow-600' : 'text-gray-500'}` } />
            </div>
            <span className="font-semibold">Produk Terlaris</span>
            { !loadingProducts && bestSellers.length > 0 && (
              <span className={ `px-2.5 py-1 rounded-full text-xs font-medium ${activeTab === 'product' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'
                }` }>
                { bestSellers.length }
              </span>
            ) }
          </button>
        </div>

        {/* Kategori Terlaris - Table Section */ }
        { activeTab === 'category' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-purple-100/30">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Kategori Terlaris</h2>
              {/* <p className="text-gray-600">Analisis penjualan berdasarkan kategori produk</p> */ }
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                      Ranking
                    </th>
                    <th className="px-8 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-8 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                      Total Terjual
                    </th>
                    <th className="px-8 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                      Omset
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  { loadingCategories ? (
                    <tr>
                      <td colSpan={ 4 } className="px-8 py-8">
                        <div className="animate-pulse space-y-4">
                          { [ ...Array( 5 ) ].map( ( _, i ) => (
                            <div key={ i } className="grid grid-cols-4 gap-6">
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                              <div className="h-5 bg-gray-200 rounded-full"></div>
                            </div>
                          ) ) }
                        </div>
                      </td>
                    </tr>
                  ) : categoryData.length === 0 ? (
                    <tr>
                      <td colSpan={ 4 } className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 bg-gray-100 rounded-full mb-4">
                            <MdCategory className="text-4xl text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">tidak ada data</h3>
                          {/* <p className="text-gray-500">Data akan muncul setelah ada transaksi penjualan</p> */}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    categoryPageData.map( ( category, index ) => {
                      const rank = categoryStartIndex + index + 1;
                      return (
                        <tr key={ index } className="hover:bg-gray-50/80 transition-colors duration-200">
                          <td className="px-8 py-4">
                            <div className="flex items-center">
                              <span className={ `inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-sm ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                                rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                                  rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                                    'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                                }` }>
                                { rank }
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-sm">
                                  <HiOutlineCube className="h-7 w-7 text-purple-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  { category.category_name }
                                </div>
                                {/* <div className="text-xs text-gray-500">ID: {category.category_id}</div> */ }
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-sm font-medium text-gray-700 text-right">{ category.total_qty.toLocaleString() }</td>
                          <td className="px-8 py-4 text-sm font-medium text-gray-700 text-right">{ formatRupiah( category.total_omzet ) }</td>
                        </tr>
                      );
                    } )
                  ) }
                </tbody>
              </table>
            </div>
            { !loadingCategories && categoryData.length > pageSize && (
              <Pagination
                total={ categoryData.length }
                page={ categoryPage }
                setPage={ setCategoryPage }
                startIndex={ categoryStartIndex }
                endIndex={ categoryEndIndex }
                totalPages={ categoryTotalPages }
              />
            ) }
          </div>
        ) }

        {/* Produk Terlaris - Table Section */ }
        { activeTab === 'product' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-yellow-100/30">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Produk Terlaris</h2>
              {/* <p className="text-gray-600">Analisis produk dengan penjualan tertinggi</p> */ }
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="px-8 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                      Ranking
                    </th>
                    <th className="px-8 py-4 text-left font-semibold text-xs uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-8 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                      Total Terjual
                    </th>
                    <th className="px-8 py-4 text-right font-semibold text-xs uppercase tracking-wider">
                      Omset
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  { loadingProducts ? (
                    <tr>
                      <td colSpan={ 4 } className="px-8 py-12 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                          <span className="ml-4 text-gray-600 font-medium">Memuat data produk...</span>
                        </div>
                      </td>
                    </tr>
                  ) : bestSellers.length === 0 ? (
                    <tr>
                      <td colSpan={ 4 } className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="p-4 bg-gray-100 rounded-full mb-4">
                            <MdTrendingUp className="text-4xl text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada data produk terlaris</h3>
                          <p className="text-gray-500">Data akan muncul setelah ada transaksi penjualan</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bestSellersPage.map( ( product, index ) => {
                      const rank = productStartIndex + index + 1;
                      return (
                        <tr key={ index } className="hover:bg-gray-50/80 transition-colors duration-200">
                          <td className="px-8 py-4">
                            <div className="flex items-center">
                              <span className={ `inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-sm ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                                rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                                  rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                                    'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                                }` }>
                                { rank }
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-sm">
                                  <HiOutlineCube className="h-7 w-7 text-yellow-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  { product.product_name }
                                </div>
                                <div className="text-xs text-gray-500">
                                  SKU: { product.product_sku }
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-sm font-medium text-gray-700 text-right">{ product.total_qty.toLocaleString() }</td>
                          <td className="px-8 py-4 text-sm font-medium text-gray-700 text-right">{ formatRupiah( product.total_omzet ) }</td>
                        </tr>
                      );
                    } )
                  ) }
                </tbody>
              </table>
            </div>
            { !loadingProducts && bestSellers.length > pageSize && (
              <Pagination
                total={ bestSellers.length }
                page={ productPage }
                setPage={ setProductPage }
                startIndex={ productStartIndex }
                endIndex={ productEndIndex }
                totalPages={ productTotalPages }
              />
            ) }
          </div>
        ) }
      </div>
    </Layout>
  );
};

export default OwnerLaporanTerlaris;
