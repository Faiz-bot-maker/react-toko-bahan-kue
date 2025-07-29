import React from 'react';
import { HiOutlineUserCircle } from 'react-icons/hi';

const Header = () => {
  return (
    <header className="bg-white/80 text-gray-800 border-b border-jade-200 h-16 flex items-center justify-end px-10 shadow-xl backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold text-jade-700 hidden sm:block">Admin</span>
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-jade-100 to-blue-100 flex items-center justify-center border-2 border-jade-300 shadow hover:scale-110 hover:border-jade-500 transition-all cursor-pointer">
          <HiOutlineUserCircle className="text-jade-500 text-2xl" />
        </div>
      </div>
    </header>
  );
};

export default Header; 