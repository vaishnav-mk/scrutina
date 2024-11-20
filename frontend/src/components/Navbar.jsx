import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-indigo-600 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-2xl font-bold">Job Scraper</h2>
        <div>
          <Link to="/" className="text-white mx-4 hover:text-indigo-300">
            Home
          </Link>
          <Link to="/jobs" className="text-white mx-4 hover:text-indigo-300">
            Previous Jobs
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
