import React from "react";
import {
  FaSearch,
  FaHeart,
  FaUser,
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaCartArrowDown,
} from "react-icons/fa";
import { BsJournalAlbum } from "react-icons/bs";
import { NavLink, useLocation } from "react-router-dom";

function Footer() {
  const location = useLocation();
  const currentPath = location.pathname;
  // const [activeIcon, setActiveIcon] = useState(null);

  // function to determine if a path is active
  const isPathActive = (path) => {
    if (path === "/home") {
      return currentPath === "/home";
    } else {
      return currentPath.includes(path);
    }
  };

  return (
    <>
      <footer className="bg-current p-1 shadow-md w-full hidden md:block z-10">
        <div className="w-full mx-auto max-w-screen-2xl p-2 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-600 flex items-center">
            © 2025{" "}
            <a href="#" className="hover:underline ml-1">
              LeckerLex
            </a>
            . All Rights Reserved.
            <span className="flex ml-4 space-x-2">
              <NavLink
                to="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <FaFacebook
                  size={24}
                  className="text-blue-500 hover:scale-125"
                />
              </NavLink>
              <NavLink
                to="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <FaWhatsapp
                  size={24}
                  className="text-green-500 hover:scale-125"
                />
              </NavLink>
              <NavLink
                to="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <FaInstagram
                  size={24}
                  className="text-pink-500 hover:scale-125"
                />
              </NavLink>
            </span>
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-600 sm:mt-0">
            <li>
              <NavLink to="#" className="hover:underline me-4 md:me-6">
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="#" className="hover:underline me-4 md:me-6">
                Privacy Policy
              </NavLink>
            </li>
            <li>
              <NavLink to="#" className="hover:underline">
                Contact
              </NavLink>
            </li>
          </ul>
        </div>
      </footer>

      {/* NavBar for smaller screens */}

      <nav className="bg-green-50 rounded-lg shadow-md mx-auto fixed bottom-0 w-full md:hidden z-30">
        <ul className="flex justify-around p-2 text-sm font-medium text-gray-700">
          <li className="hover:text-green-500">
            <NavLink
              to="/home"
              className={`hover:underline ${
                isPathActive("/home") ? "text-green-500" : ""
              }`}
            >
              <FaSearch size={20} />
            </NavLink>
          </li>
          <li className="hover:text-green-500">
            <NavLink
              to="shopping-list"
              className={`hover:underline ${
                isPathActive("/home/shopping-list") ? "text-green-500" : ""
              }`}
            >
              <FaCartArrowDown size={20} />
            </NavLink>
          </li>
          <li className="hover:text-red-500">
            <NavLink
              to="favorites"
              className={`hover:underline ${
                isPathActive("/home/favorites") ? "text-green-500" : ""
              }`}
            >
              <FaHeart size={20} />
            </NavLink>
          </li>
          <li className="hover:text-green-500">
            <NavLink
              to="journal"
              className={`hover:underline ${
                isPathActive("/home/journal") ? "text-green-500" : ""
              }`}
            >
              <BsJournalAlbum size={20} />
            </NavLink>
          </li>
          <li className="hover:text-green-500">
            <NavLink
              to="profile"
              className={`hover:underline ${
                isPathActive("/home/profile") ? "text-green-500" : ""
              }`}
            >
              <FaUser size={20} />
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Footer;
