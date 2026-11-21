
import React from 'react';
import { FiSearch, FiUser } from 'react-icons/fi';

const Navbar = () => {
  return (
    <header className="bg-primary text-text p-4 flex justify-end items-center shadow-md">
      <div className="flex items-center">
        <div className="relative mr-4">
          <input type="text" placeholder="Search..." className="bg-accent text-text rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-highlight" />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
        </div>
        <FiUser className="text-2xl text-text-secondary" />
      </div>
    </header>
  );
};

export default Navbar;
