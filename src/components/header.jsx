import { LogOut } from 'lucide-react';

import { NavLink, useNavigate } from "react-router-dom"; 


const Header = () => {
  const navigate=useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate("/login")
  }
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
    <header className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg py-4 px-6 flex justify-between items-center shadow-2xl">
    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-white">
      Splitwise
    </h1>

    <nav className="flex space-x-6">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `text-lg font-semibold ${
            isActive || location.pathname === "/" ? "text-white" : "text-gray-400"
          } hover:text-white`
        }
      >
        Home
      </NavLink>

      <NavLink
        to="/create-group"
        className={({ isActive }) =>
          `text-lg font-semibold ${
            isActive || location.pathname === "/create-group" ? "text-white" : "text-gray-400"
          } hover:text-white`
        }
      >
        Create Group
      </NavLink>
    </nav>

    <button
      onClick={handleLogout}
      className="flex items-center bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
    >
      <LogOut className="mr-2 h-5 w-5" /> Logout
    </button>
  </header>
  </div>
  )
}

export default Header