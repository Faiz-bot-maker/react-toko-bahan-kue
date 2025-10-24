import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlineLogout, HiOutlineCog } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [ isDropdownOpen, setIsDropdownOpen ] = useState( false );
  const dropdownRef = useRef( null );
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect( () => {
    const handleClickOutside = ( event ) => {
      if ( dropdownRef.current && !dropdownRef.current.contains( event.target ) ) {
        setIsDropdownOpen( false );
      }
    };

    document.addEventListener( 'mousedown', handleClickOutside );
    return () => {
      document.removeEventListener( 'mousedown', handleClickOutside );
    };
  }, [] );

  const handleLogout = async () => {
    const result = await logout();
    if ( !result.success ) {
      navigate( '/login', { state: { logoutError: result.message } } );
    } else {
      navigate( '/login' );
    }
  };

  return (
    <header className="bg-white/80 text-gray-800 h-16 flex items-center justify-end px-10 backdrop-blur-lg relative z-[99999]">
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-base font-semibold text-jade-700">
            { user?.name || user?.username || 'User' }
          </div>
          <div className="text-xs text-jade-600 capitalize">
            { user?.role || 'user' }
            { user?.branch && ` • ${user.branch}` }
          </div>
        </div>
        <div className="relative" ref={ dropdownRef }>
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-jade-100 to-blue-100 flex items-center justify-center border-2 border-jade-300 shadow hover:scale-110 hover:border-jade-500 transition-all cursor-pointer"
            onClick={ () => setIsDropdownOpen( !isDropdownOpen ) }
          >
            <HiOutlineUserCircle className="text-jade-500 text-xl" />
          </div>

          {/* Dropdown Menu */ }
          { isDropdownOpen && (
            <div className="fixed right-10 top-16 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[999999]">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{ user?.name || user?.username || 'User' }</p>
                <p className="text-xs text-gray-500 capitalize">
                  { user?.role || 'user' }
                  { user?.branch && ` • ${user.branch}` }
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={ handleLogout }
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <HiOutlineLogout className="mr-3 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          ) }

        </div>
      </div>
    </header>
  );
};

export default Header;
