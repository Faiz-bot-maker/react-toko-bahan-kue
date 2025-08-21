import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Main from './Main';

const Layout = ({
  children,
  outerClassName = 'flex h-screen bg-gradient-to-tr from-white via-blue-50 to-jade-50',
  mainClassName = 'flex-1 overflow-y-auto p-8 min-w-0',
  headerSticky = true,
  headerContainerClassName = 'sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm',
}) => {
  return (
    <div className={outerClassName}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {headerSticky ? (
          <div className={headerContainerClassName}>
            <Header />
          </div>
        ) : (
          <Header />
        )}
        <Main className={mainClassName}>{children}</Main>
      </div>
    </div>
  );
};

export default Layout; 