import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineCube, HiOutlineClipboardList, HiOutlineUser, HiOutlineShoppingBag, HiOutlineUsers, HiOutlineDocumentReport, HiOutlineCurrencyDollar, HiOutlineOfficeBuilding, HiOutlineTruck, HiOutlineIdentification, HiOutlineShoppingCart } from 'react-icons/hi';

const menuOperasional = [
  { name: 'Dashboard', path: '/dashboard', icon: <HiOutlineHome className="inline text-lg" /> },
  { name: 'Produk', path: '/products', icon: <HiOutlineCube className="inline text-lg" /> },
  { name: 'Pelanggan', path: '/pelanggan', icon: <HiOutlineUsers className="inline text-lg" /> },
  { name: 'Kategori', path: '/categories', icon: <HiOutlineShoppingCart className="inline text-lg" /> },
  { name: 'Cabang', path: '/cabang', icon: <HiOutlineOfficeBuilding className="inline text-lg" /> },
  { name: 'Distributor', path: '/distributor', icon: <HiOutlineTruck className="inline text-lg" /> },
  { name: 'Role', path: '/role', icon: <HiOutlineIdentification className="inline text-lg" /> },
  { name: 'User', path: '/users', icon: <HiOutlineUser className="inline text-lg" /> },
];

const menuLaporan = [
  { name: 'Laporan Penjualan', path: '/laporan-penjualan', icon: <HiOutlineDocumentReport className="inline text-lg" /> },
  { name: 'Laporan Terlaris', path: '/laporan-terlaris', icon: <HiOutlineClipboardList className="inline text-lg" /> },
  { name: 'Keuangan', path: '/keuangan', icon: <HiOutlineCurrencyDollar className="inline text-lg" /> },
];

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="w-60 h-screen flex flex-col justify-between bg-[#11493E] shadow-xl">
      <div>
        <div className="flex flex-col items-center h-40 border-b border-[#11493E] mb-2 pt-6 select-none gap-2 bg-[#11493E]">
          <div className="w-10 h-10 rounded-full bg-gray-300 mb-2" />
          <span className="text-lg font-bold text-white tracking-wide">AZKA SHOP</span>
        </div>
        <div className="px-6 text-xs text-[#B2C8BC] mb-2 mt-4">Operasional</div>
        <nav>
          <ul className="flex flex-col gap-1">
            {menuOperasional.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-2 rounded-lg font-medium text-sm gap-3 transition-all duration-200 relative hover:bg-[#1B5E4B] hover:text-white ${location.pathname === item.path ? 'bg-[#1B5E4B] text-white font-bold' : 'text-[#E6F2ED]'}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-6 text-xs text-[#B2C8BC] mt-6 mb-2">Laporan</div>
        <nav>
          <ul className="flex flex-col gap-1">
            {menuLaporan.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-2 rounded-lg font-medium text-sm gap-3 transition-all duration-200 relative hover:bg-[#1B5E4B] hover:text-white ${location.pathname === item.path ? 'bg-[#1B5E4B] text-white font-bold' : 'text-[#E6F2ED]'}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="text-xs text-[#B2C8BC] text-center mb-3 mt-4 select-none">
        <span className="mr-1">&copy;</span>2025 Trio Duo
      </div>
    </aside>
  );
};

export default Sidebar; 