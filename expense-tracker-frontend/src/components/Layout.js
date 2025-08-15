import React from 'react';
import Navbar    from './Navbar';
import SubNavbar from './SubNavbar';
import { useLocation } from 'react-router-dom';

function Layout({ children }) {
  const { pathname } = useLocation();

  // 🌟 Add any “home-style” routes here
  const homePaths = [
    '/',            // redirect root
    '/dashboard',
    '/profile',
    '/admin',
    '/manager'
  ];

  const showMainNavbar = homePaths.includes(pathname);

  return (
    <>
      {showMainNavbar ? <Navbar /> : <SubNavbar />}
      <div className="main-content">{children}</div>
    </>
  );
}

export default Layout;
