import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Redux/authSlice';
import logo from '../utils/target_Trek_logo_2.jpg';

const adminLinks = [
  {label:'Profile' ,path :'/profile'},
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Manage Bookings', path: '/admin/booking' },
  { label: 'Manage Slots', path: '/admin/slots' },
  { label: 'Add Blog Post', path: '/admin/add-blog' },
  { label: 'Manage Blogs', path: '/blog-manage' },
  { label: 'Add Portfolio', path: '/admin/add-portfolio' },
  { label: 'Manage Portfolio', path: '/portfolio-manage' },
  { label: 'Generate Review Link', path: '/admin/generate-review-link' },
  { label: 'Manage Reviews', path: '/admin/manage-reviews' },
  { label: 'Contact Query', path: '/contact-query' },
];

const Navbar = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const mobileAvatarRef = useRef(null);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.role === 'Employee');

  const [navItems, setNavItems] = useState([
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Affiliate', path: '/affiliate-marketing' },
    { label: 'Blog', path: '/blogs' },
    //{ label: 'Portfolio', path: '/portfolio' },
   
  ]);

  useEffect(() => {
    if (isAdmin) {
      const dashboardLink = { label: 'Dashboard', path: '/dashboard' };
      if (!navItems.find(item => item.label === 'Dashboard')) {
        setNavItems(prevNavItems => [dashboardLink, ...prevNavItems]);
      }
    } else {
      setNavItems(prevNavItems => prevNavItems.filter(item => item.label !== 'Dashboard'));
    }
  }, [isAdmin]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setIsAdminDropdownOpen(false);
  };

  const closeMobileMenu = () => setMenuOpen(false);
  const toggleAdminDropdown = () => setIsAdminDropdownOpen(!isAdminDropdownOpen);
  const closeAdminDropdown = () => setIsAdminDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isAdminDropdownOpen) return;

      const isClickInsideDropdown = dropdownRef.current?.contains(event.target);
      const isClickInsideDesktopAvatar = avatarRef.current?.contains(event.target);
      const isClickInsideMobileAvatar = mobileAvatarRef.current?.contains(event.target);

      if (!isClickInsideDropdown && !isClickInsideDesktopAvatar && !isClickInsideMobileAvatar) {
        closeAdminDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAdminDropdownOpen]);

  return (
    <>
      <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-50 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold text-blue-600 transition duration-300 hover:text-blue-700 ">
            <img src={logo} alt="Company Logo" className=" w-[30px] h-auto" />
          </NavLink>
          <ul className="hidden md:flex space-x-8 text-gray-700 font-medium flex-grow justify-center">
            {navItems.map(({ label, path }) => (
              <li key={label}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `transition duration-300 ease-in-out transform hover:scale-105 ${
                      isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center space-x-4 relative">
            {isAdmin ? (
              <div ref={avatarRef}>
                <button
                  onClick={toggleAdminDropdown}
                  className="p-1.5 rounded-full border-2 border-green-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
                  aria-label="Admin Menu"
                  aria-haspopup="true"
                  aria-expanded={isAdminDropdownOpen}
                >
                  <User className="text-blue-600" size={22} />
                </button>
                {isAdminDropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-60"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <div className="px-4 py-2 border-b mb-1">
                      <p className="text-sm text-gray-700 font-medium truncate">
                        Signed in as
                      </p>
                      <p className="text-sm text-gray-900 font-semibold truncate">
                        {user?.name || 'Admin'}
                      </p>
                    </div>
                    {adminLinks.map(({ label, path }) => (
                      <NavLink
                        key={path}
                        to={path}
                        onClick={closeAdminDropdown}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left ${
                            isActive ? 'bg-gray-100 text-gray-900' : ''
                          }`
                        }
                        role="menuitem"
                      >
                        {label}
                      </NavLink>
                    ))}
                    <div className="border-t mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        role="menuitem"
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                to="/contact"
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Contact Us
              </NavLink>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden focus:outline-none text-gray-700 hover:text-blue-600"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-4 pb-4 border-t border-gray-200">
            <ul className="flex flex-col space-y-3 text-gray-700 font-medium pt-3">
              {navItems.map(({ label, path }) => (
                <li key={label}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `block py-2 transition duration-300 ease-in-out transform hover:scale-105 hover:text-blue-600 ${
                        isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'
                      }`
                    }
                    onClick={closeMobileMenu}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
              <li className="relative pt-2 border-t mt-2">
                {isAdmin ? (
                  <div ref={mobileAvatarRef}>
                    <button
                      onClick={toggleAdminDropdown}
                      className="w-full flex items-center space-x-2 cursor-pointer py-2 text-left text-blue-600 font-semibold transition duration-300"
                      aria-label="Admin Menu"
                      aria-haspopup="true"
                      aria-expanded={isAdminDropdownOpen}
                    >
                      <div className="p-1 rounded-full border-2 border-green-500 inline-block">
                        <User size={18} />
                      </div>
                      <span>{user?.name || 'Admin Panel'}</span>
                    </button>
                    {isAdminDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-60"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button-mobile"
                      >
                        <div className="px-4 py-2 border-b mb-1">
                          <p className="text-sm text-gray-700 font-medium truncate">
                            Signed in as
                          </p>
                          <p className="text-sm text-gray-900 font-semibold truncate">
                            {user?.name || 'Admin'}
                          </p>
                        </div>
                        {adminLinks.map(({ label, path }) => (
                          <NavLink
                            key={path}
                            to={path}
                            onClick={() => {
                              closeAdminDropdown();
                              closeMobileMenu();
                            }}
                            className={({ isActive }) =>
                              `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left ${
                                isActive ? 'bg-gray-100 text-gray-900' : ''
                              }`
                            }
                            role="menuitem"
                          >
                            {label}
                          </NavLink>
                        ))}
                        <div className="border-t mt-1 pt-1">
                          <button
                            onClick={() => {
                              handleLogout();
                              closeMobileMenu();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                            role="menuitem"
                          >
                            <LogOut size={16} className="inline mr-2" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to="/contact"
                    className="block py-2 transition duration-300 ease-in-out transform hover:scale-105 text-blue-600 font-semibold"
                    onClick={closeMobileMenu}
                  >
                    Contact Us
                  </NavLink>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;