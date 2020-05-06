import React from 'react';

import NavBar from './NavBar';

const Header = () => {
  return (
    <div>
      <div className="bg-gray-200 py-4">
        <img className="h-24 mx-auto" src="/logo.png" alt="Logo" height="60" />
      </div>
      <NavBar />
    </div>
  );
};

export default Header;
