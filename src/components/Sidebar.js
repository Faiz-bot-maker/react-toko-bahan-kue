import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineDocumentReport,
  HiOutlineCurrencyDollar,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi';

const menus = [
  {
    section: 'Produk & Kategori',
    icon: <HiOutlineCube className="text-sm" />,
    items: [
      { name: 'Produk', path: '/products' },
      { name: 'Kategori', path: '/categories' },
      { name: 'Inventory', path: '/own-inventory' },
      { name: 'Opname', path: '/opname-list' },
    ],
  },
  {
    section: 'Manajemen Relasi',
    icon: <HiOutlineOfficeBuilding className="text-sm" />,
    items: [
      { name: 'Cabang', path: '/cabang' },
      { name: 'Distributor', path: '/distributor' },
    ],
  },
  {
    section: 'Laporan',
    icon: <HiOutlineDocumentReport className="text-sm" />,
    items: [
      { name: 'Laporan Barang Terlaris', path: '/laporan-produk-terlaris' },
      { name: 'Laporan Pembelian', path: '/own-laporan-pembelian' },
      { name: 'Laporan Pergerakan Stok', path: '/own-pergerakan-stok' },
      { name: 'Laporan Transaksi Keluar', path: '/own-transaksi-keluar' },
      { name: 'Laporan Piutang', path: '/laporan-piutang' },
      { name: 'Laporan Penjualan', path: '/laporan-penjualan' },
      { name: 'Laporan Pengeluaran', path: '/laporan-pengeluaran' },
      { name: 'Laporan Laba Rugi', path: '/report-loss' },
    ],
  },
  {
    section: 'Keuangan',
    icon: <HiOutlineCurrencyDollar className="text-sm" />,
    items: [
      { name: 'Pengeluaran', path: '/pengeluaran' },
      { name: 'Alur Kas', path: '/own-alur-kas' },
      { name: 'Modal', path: '/Modal' },
      { name: 'Keuangan', path: '/keuangan' },
    ],
  },
  {
    section: 'Akun & Akses',
    icon: <HiOutlineIdentification className="text-sm" />,
    items: [
      { name: 'Role', path: '/role' },
      { name: 'User', path: '/users' },
    ],
  },
];

const adminMenus = [
  {
    section: 'Inventori',
    icon: <HiOutlineCube className="text-sm" />,
    items: [{ name: 'Inventori', path: '/admin/inventory' }],
  },
  {
    section: 'Manajemen Relasi',
    icon: <HiOutlineOfficeBuilding className="text-sm" />,
    items: [{ name: 'Distributor', path: '/admin/distributor' }],
  },
  {
    section: 'Laporan',
    icon: <HiOutlineDocumentReport className="text-sm" />,
    items: [
      { name: 'Laporan Penjualan', path: '/admin/laporan-penjualan' },
      { name: 'Laporan Pembelian', path: '/admin/adm-laporan-pembelian' },
      { name: 'Laporan Pergerakan Stok', path: '/admin/adm-pergerakan-stok' },
      { name: 'Laporan Pengeluaran', path: '/admin/out-report' },
      { name: 'Laporan Piutang', path: '/admin/adm-piutang' },
      { name: 'Laporan Transaksi Pengeluaran', path: '/admin/adm-transaksi-keluar' },
    ],
  },
  {
    section: 'Keuangan',
    icon: <HiOutlineCurrencyDollar className="text-sm" />,
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
  const [openSections, setOpenSections] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const isMounted = useRef(false);
  const sidebarRef = useRef(null);

  // Restore open sections
  useEffect(() => {
    if (!isMounted.current) {
      const stored = sessionStorage.getItem('openSections');
      if (stored) {
        try {
          setOpenSections(JSON.parse(stored));
        } catch {
          console.error('Invalid session data');
        }
      }
      isMounted.current = true;
    }
  }, []);

  // Save open sections
  useEffect(() => {
    if (isMounted.current) {
      sessionStorage.setItem('openSections', JSON.stringify(openSections));
    }
  }, [openSections]);

  // Ambil role user
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserRole(userData.role);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, [isAuthenticated]);

  // Restore scroll setelah DOM dirender
  useLayoutEffect(() => {
    if (sidebarRef.current) {
      const savedScroll = sessionStorage.getItem('sidebarScroll');
      if (savedScroll) {
        sidebarRef.current.scrollTop = parseInt(savedScroll, 10);
      }
    }
  }, [openSections]);

  // Simpan scroll
  const handleScroll = () => {
    if (sidebarRef.current) {
      sessionStorage.setItem('sidebarScroll', sidebarRef.current.scrollTop);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <aside className="w-60 h-screen bg-[#11493E] shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1B5E4B] text-white text-[18px] font-semibold flex justify-center items-center tracking-wide">
        <span className="uppercase">Azka<span className="text-[#B2C8BC]">Shop</span></span>
      </div>

      {/* Menu Section */}
      <div
        ref={sidebarRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto mt-3 pr-1 scrollbar-thin scrollbar-thumb-[#1f6350] scrollbar-track-transparent"
      >
        <Link
          to="/dashboard"
          className={`flex items-center px-6 py-2 rounded-md gap-2 font-medium text-xs transition-all duration-200 hover:bg-[#1B5E4B] hover:text-white ${
            location.pathname === '/dashboard'
              ? 'bg-[#1B5E4B] text-white'
              : 'text-[#E6F2ED]'
          }`}
        >
          <HiOutlineHome className="text-sm" />
          <span>Dashboard</span>
        </Link>

        {(userRole?.toLowerCase() === 'admin' ||
          userRole?.toLowerCase() === 'super_admin'
          ? adminMenus
          : menus
        ).map((menuSection, index) => (
          <div key={index} className="mt-2">
            <button
              onClick={() => toggleSection(menuSection.section)}
              className="flex justify-between items-center w-full px-6 py-2 text-[11px] text-[#B2C8BC] font-medium hover:text-white transition-all"
            >
              <span className="flex items-center gap-2">
                <span className="text-[#E6F2ED]">{menuSection.icon}</span>
                {menuSection.section}
              </span>
              {openSections.includes(menuSection.section) ? (
                <HiChevronUp className="text-white text-xs" />
              ) : (
                <HiChevronDown className="text-[#B2C8BC] text-xs" />
              )}
            </button>

            {openSections.includes(menuSection.section) && (
              <ul className="flex flex-col gap-1 mt-1 pl-2 border-l border-[#1B5E4B] ml-4">
                {menuSection.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-8 py-1.5 rounded-md text-[11px] transition-all duration-200 hover:bg-[#1B5E4B] hover:text-white ${
                        location.pathname === item.path
                          ? 'bg-[#1B5E4B] text-white font-semibold'
                          : 'text-[#E6F2ED]'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-[10px] text-[#B2C8BC] text-center py-3 border-t border-[#1B5E4B] tracking-wide">
        © 2025 <span className="font-semibold text-[#E6F2ED]">Trio Duo</span>
      </div>
    </aside>
  );
};

export default Sidebar;
