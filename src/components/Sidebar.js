import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineDocumentReport,
  HiOutlineCurrencyDollar,
  HiOutlineOfficeBuilding,
  // HiOutlineTruck,
  HiOutlineIdentification,
  // HiOutlineShoppingCart,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi';

const menus = [
  {
    section: 'Produk & Kategori',
    icon: <HiOutlineCube className="text-xs" />,
    items: [
      { name: 'Produk', path: '/products' },
      { name: 'Kategori', path: '/categories' },
      { name: 'Inventory', path: '/own-inventory' },
    ],
  },
  {
    section: 'Manajemen Relasi',
    icon: <HiOutlineOfficeBuilding className="text-xs" />,
    items: [
      { name: 'Cabang', path: '/cabang' },
      { name: 'Distributor', path: '/distributor' },
    ],
  },
  {
    section: 'Laporan',
    icon: <HiOutlineDocumentReport className="text-xs" />,
    items: [
      { name: 'Laporan Barang Terlaris', path: '/laporan-produk-terlaris' },
      { name: 'Laporan Pembelian', path: '/own-laporan-pembelian' },
      { name: 'Laporan Pergerakan Stok', path: '/own-pergerakan-stok' },
      { name: 'Laporan Transaksi Keluar', path: '/own-transaksi-keluar' },
      { name: 'Laporan Piutang', path: '/laporan-piutang' },
      { name: 'Laporan Penjualan', path: '/laporan-penjualan' },
      { name: 'Laporan Pengeluaran', path: '/laporan-pengeluaran' },
    ],
  },
  {
    section: 'Keuangan',
    icon: <HiOutlineCurrencyDollar className="text-xs" />,
    items: [
      { name: 'Alur Kas', path: '/own-alur-kas' },
      { name: 'Modal', path: '/Modal' },
      { name: 'Keuangan', path: '/keuangan' },
      // { name: 'Pengeluaran', path: '/pengeluaran' },
    ],
  },
  {
    section: 'Akun & Akses',
    icon: <HiOutlineIdentification className="text-xs" />,
    items: [
      { name: 'Role', path: '/role' },
      { name: 'User', path: '/users' },
    ],
  },
];

const adminMenus = [

  {
    section: 'Inventori',
    icon: <HiOutlineCube className="text-xs" />,
    items: [
      // { name: 'Produk', path: '/admin/products' },
      // { name: 'Kategori', path: '/admin/categories' },
      { name: 'Inventori', path: '/admin/inventory' },
    ],
  },
  {
    section: 'Manajemen Relasi',
    icon: <HiOutlineOfficeBuilding className="text-xs" />,
    items: [
      // { name: 'Cabang', path: '/admin/cabang' },
      { name: 'Distributor', path: '/admin/distributor' },
    ],
  },
  // {
  //   section: 'Admin - Akun & Akses',
  //   icon: <HiOutlineIdentification className="text-xs" />,
  //   items: [
  //     { name: 'Role', path: '/admin/roles' },
  //     { name: 'User', path: '/admin/users' },
  //   ],
  // },

  {
    section: 'Laporan',
    icon: <HiOutlineDocumentReport className="text-xs" />,
    items: [
      { name: 'Laporan Penjualan', path: '/admin/laporan-penjualan' },
      { name: 'Laporan Pergerakan Stok', path: '/admin/adm-pergerakan-stok' },
      { name: 'Laporan Pengeluaran', path: '/admin/out-report' },
      { name: 'Laporan Piutang', path: '/admin/adm-piutang' },
      { name: 'Laporan Transaksi Pengeluaran', path: '/admin/adm-transaksi-keluar' },
    ],
  },
  {
    section: 'Keuangan',
    icon: <HiOutlineCurrencyDollar className="text-xs" />,
    items: [
      { name: 'Alur Kas', path: '/admin/adm-alur-kas' },
      { name: 'Modal', path: '/admin/modal' },
      { name: 'Keuangan', path: '/admin/keuangan' },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [ openSections, setOpenSections ] = useState( [] );
  const [ userRole, setUserRole ] = useState( null );
  // const [ hasAdminAccess, setHasAdminAccess ] = useState( false );
  const isMounted = useRef( false );

  useEffect( () => {
    if ( !isMounted.current ) {
      const stored = sessionStorage.getItem( 'openSections' );
      if ( stored ) {
        try {
          setOpenSections( JSON.parse( stored ) );
        } catch ( e ) {
          console.error( 'Invalid session data' );
        }
      }
      isMounted.current = true;
    }
  }, [] );

  // Check user role for admin access
  useEffect( () => {
    const checkUserRole = async () => {
      if ( !isAuthenticated ) {
        // setHasAdminAccess( false );
        return;
      }

      // First check if we have user data from AuthContext
      const savedUser = localStorage.getItem( 'user' );
      if ( savedUser ) {
        try {
          const userData = JSON.parse( savedUser );
          const userRole = userData.role;

          setUserRole( userRole );

          // Define admin roles that can access admin pages
          // const adminRoles = [ 'admin', 'owner' ];
          // const hasAccess = adminRoles.includes( userRole?.toLowerCase() );

          // setHasAdminAccess( hasAccess );
          return;
        } catch ( error ) {
          console.error( 'Error parsing saved user data:', error );
        }
      }

      // Fallback: fetch from API if no saved data
      // try {
      //   const response = await axios.get( `${process.env.REACT_APP_API_URL}/current`, {
      //     headers: {
      //       Authorization: localStorage.getItem( 'authToken' ),
      //       'ngrok-skip-browser-warning': 'true',
      //     }
      //   } );

      //   const userData = response.data?.data || response.data;
      //   const userRole = userData.role?.name || userData.role_name;

      //   setUserRole( userRole );

      //   // Define admin roles that can access admin pages
      //   const adminRoles = [ 'admin', 'owner' ];
      //   const hasAccess = adminRoles.includes( userRole?.toLowerCase() );

      //   // Store user role in localStorage for consistency
      //   if ( hasAccess ) {
      //     localStorage.setItem( 'userRole', userRole );
      //   }

      //   setHasAdminAccess( hasAccess );
      // } catch ( error ) {
      //   console.error( 'Failed to fetch user role:', error );
      //   setHasAdminAccess( false );
      // }
    };

    checkUserRole();
  }, [ isAuthenticated ] );

  useEffect( () => {
    if ( isMounted.current ) {
      sessionStorage.setItem( 'openSections', JSON.stringify( openSections ) );
    }
  }, [ openSections ] );

  const toggleSection = ( section ) => {
    setOpenSections( ( prev ) =>
      prev.includes( section )
        ? prev.filter( ( s ) => s !== section )
        : [ ...prev, section ]
    );
  };

  return (
    <aside className="w-48 h-screen bg-[#11493E] shadow-xl flex flex-col overflow-hidden">
      {/* Logo */ }
      <div className="px-6 py-4 text-white text-[18px] font-bold tracking-wide flex justify-center items-center gap-1">
        <span>AZKA SHOP</span>
      </div>

      {/* Menu */ }
      <div className="flex-1 mt-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#1f6350] scrollbar-track-transparent">
        {/* Dashboard */ }
        <Link
          to="/dashboard"
          className={ `flex items-center px-6 py-1.5 rounded-md font-medium text-xs gap-2 transition-all duration-200 hover:bg-[#1B5E4B] hover:text-white ${location.pathname === '/dashboard'
            ? 'bg-[#1B5E4B] text-white font-semibold'
            : 'text-[#E6F2ED]'
            }` }
        >
          <HiOutlineHome className="text-xs" />
          <span>Beranda</span>
        </Link>

        {/* Show menus based on user role */ }
        { userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'super_admin' ? (
          // Admin menus
          adminMenus.map( ( menuSection, index ) => (
            <div key={ `admin-${index}` } className="mt-2">
              {/* Section Title dengan icon */ }
              <button
                onClick={ () => toggleSection( menuSection.section ) }
                className="flex justify-between items-center w-full px-6 py-1 text-[10px] text-[#B2C8BC] hover:text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  { menuSection.icon }
                  { menuSection.section }
                </span>
                { openSections.includes( menuSection.section ) ? (
                  <HiChevronUp className="text-white text-xs" />
                ) : (
                  <HiChevronDown className="text-[#B2C8BC] text-xs" />
                ) }
              </button>

              {/* Section Items tanpa icon */ }
              { openSections.includes( menuSection.section ) && (
                <ul className="flex flex-col gap-[2px] mt-1">
                  { menuSection.items.map( ( item ) => (
                    <li key={ item.path }>
                      <Link
                        to={ item.path }
                        className={ `flex items-center px-12 py-1.5 rounded-md font-normal text-[10px] transition-all duration-200 hover:bg-[#1B5E4B] hover:text-white ${location.pathname === item.path
                          ? 'bg-[#1B5E4B] text-white font-semibold'
                          : 'text-[#E6F2ED]'
                          }` }
                      >
                        { item.name }
                      </Link>
                    </li>
                  ) ) }
                </ul>
              ) }
            </div>
          ) )
        ) : (
          // Owner/Regular user menus
          menus.map( ( menuSection, index ) => (
            <div key={ index } className="mt-2">
              {/* Section Title dengan icon */ }
              <button
                onClick={ () => toggleSection( menuSection.section ) }
                className="flex justify-between items-center w-full px-6 py-1 text-[10px] text-[#B2C8BC] hover:text-white transition-all"
              >
                <span className="flex items-center gap-2">
                  { menuSection.icon }
                  { menuSection.section }
                </span>
                { openSections.includes( menuSection.section ) ? (
                  <HiChevronUp className="text-white text-xs" />
                ) : (
                  <HiChevronDown className="text-[#B2C8BC] text-xs" />
                ) }
              </button>

              {/* Section Items tanpa icon */ }
              { openSections.includes( menuSection.section ) && (
                <ul className="flex flex-col gap-[2px] mt-1">
                  { menuSection.items.map( ( item ) => (
                    <li key={ item.path }>
                      <Link
                        to={ item.path }
                        className={ `flex items-center px-12 py-1.5 rounded-md font-normal text-[10px] transition-all duration-200 hover:bg-[#1B5E4B] hover:text-white ${location.pathname === item.path
                          ? 'bg-[#1B5E4B] text-white font-semibold'
                          : 'text-[#E6F2ED]'
                          }` }
                      >
                        { item.name }
                      </Link>
                    </li>
                  ) ) }
                </ul>
              ) }
            </div>
          ) )
        ) }
      </div>

      {/* Footer */ }
      <div className="text-[9px] text-[#B2C8BC] text-center py-2 border-t border-[#1B5E4B]">
        <span className="mr-1">&copy;</span>2025 Trio Duo
      </div>
    </aside>
  );
};

export default Sidebar;
