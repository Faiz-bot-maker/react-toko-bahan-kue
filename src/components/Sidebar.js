import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineClipboardList,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineCurrencyDollar,
  HiOutlineOfficeBuilding,
  HiOutlineTruck,
  HiOutlineIdentification,
  HiOutlineShoppingCart,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi';

const menus = [
  {
    section: 'Produk & Kategori',
    items: [
      { name: 'Produk', path: '/products', icon: <HiOutlineCube className="text-xs" /> },
      { name: 'Kategori', path: '/categories', icon: <HiOutlineShoppingCart className="text-xs" /> },
    ],
  },
  {
    section: 'Manajemen Relasi',
    items: [
      { name: 'Cabang', path: '/cabang', icon: <HiOutlineOfficeBuilding className="text-xs" /> },
      { name: 'Distributor', path: '/distributor', icon: <HiOutlineTruck className="text-xs" /> },
    ],
  },
  {
    section: 'Akun & Akses',
    items: [
      { name: 'Role', path: '/role', icon: <HiOutlineIdentification className="text-xs" /> },
      { name: 'User', path: '/users', icon: <HiOutlineUser className="text-xs" /> },
    ],
  },
  {
    section: 'Laporan',
    items: [
      { name: 'Laporan Piutang', path: '/laporan-piutang', icon: <HiOutlineUsers className="text-xs" /> },
      { name: 'Laporan Penjualan', path: '/laporan-penjualan', icon: <HiOutlineDocumentReport className="text-xs" /> },
      { name: 'Laporan Terlaris', path: '/laporan-terlaris', icon: <HiOutlineClipboardList className="text-xs" /> },
    ],
  },
  {
    section: 'Keuangan',
    items: [
      { name: 'Keuangan', path: '/keuangan', icon: <HiOutlineCurrencyDollar className="text-xs" /> },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState([]);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      const stored = sessionStorage.getItem('openSections');
      if (stored) {
        try {
          setOpenSections(JSON.parse(stored));
        } catch (e) {
          console.error('Invalid session data');
        }
      }
      isMounted.current = true;
    }
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      sessionStorage.setItem('openSections', JSON.stringify(openSections));
    }
  }, [openSections]);

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <aside className="w-48 h-screen bg-[#11493E] shadow-xl flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-4 text-white text-[18px] font-bold tracking-wide flex justify-center items-center gap-1">
        {/* <span className="text-base">🛒</span> */}
        <span>AZKA SHOP</span>
      </div>

      {/* Menu */}
      <div className="flex-1 mt-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#1f6350] scrollbar-track-transparent">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`flex items-center px-6 py-1.5 rounded-md font-medium text-xs gap-2 transition-all duration-200 hover:bg-[#1B5E4B] hover:text-white ${location.pathname === '/dashboard'
              ? 'bg-[#1B5E4B] text-white font-semibold'
              : 'text-[#E6F2ED]'
            }`}
        >
          <HiOutlineHome className="text-xs" />
          <span>Beranda</span>
        </Link>

        {/* Dropdown menus */}
        {menus.map((menuSection, index) => (
          <div key={index} className="mt-2">
            {/* Section Title */}
            <button
              onClick={() => toggleSection(menuSection.section)}
              className="flex justify-between items-center w-full px-6 py-1 text-[10px] text-[#B2C8BC] hover:text-white transition-all"
            >
              <span>{menuSection.section}</span>
              {openSections.includes(menuSection.section) ? (
                <HiChevronUp className="text-white text-xs" />
              ) : (
                <HiChevronDown className="text-[#B2C8BC] text-xs" />
              )}
            </button>

            {/* Section Items */}
            {openSections.includes(menuSection.section) && (
              <ul className="flex flex-col gap-[2px] mt-1">
                {menuSection.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-8 py-1.5 rounded-md font-normal text-xs gap-2 transition-all duration-200 hover:bg-[#1B5E4B] hover:text-white ${location.pathname === item.path
                          ? 'bg-[#1B5E4B] text-white font-semibold'
                          : 'text-[#E6F2ED]'
                        }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-[9px] text-[#B2C8BC] text-center py-2 border-t border-[#1B5E4B]">
        <span className="mr-1">&copy;</span>2025 Trio Duo
      </div>
    </aside>
  );
};

export default Sidebar;