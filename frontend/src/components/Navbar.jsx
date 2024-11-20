import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-3xl font-extrabold">Job Scraper</h2>
        <div>
          <Link to="/" className="text-white mx-6 hover:text-green-400">
            Home
          </Link>
          <Link to="/jobs" className="text-white mx-6 hover:text-green-400">
            Previous Jobs
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
