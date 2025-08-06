import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlineLogout, HiOutlineCog } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white/80 text-gray-800 h-16 flex items-center justify-end px-10 backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold text-jade-700 hidden sm:block">
          {user?.name || 'Admin'}
        </span>
        <div className="relative" ref={dropdownRef}>
          <div 
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-jade-100 to-blue-100 flex items-center justify-center border-2 border-jade-300 shadow hover:scale-110 hover:border-jade-500 transition-all cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <HiOutlineUserCircle className="text-jade-500 text-2xl" />
          </div>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@toko.com'}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <HiOutlineLogout className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
