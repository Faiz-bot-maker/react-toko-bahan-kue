import React from 'react';

const Main = ({ children, className = 'flex-1 overflow-y-auto p-8 min-w-0' }) => {
  return (
    <main className={className}>{children}</main>
  );
};

export default Main; 