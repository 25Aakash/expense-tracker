import React from 'react';
import Navbar from './Navbar';
import SubNavbar from './SubNavbar';
import { useLocation } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();
  const showMainNavbar = location.pathname === '/';

  return (
    <>
      {showMainNavbar ? <Navbar /> : <SubNavbar />}
      <div className="main-content">{children}</div>
    </>
  );
}

export default Layout;
