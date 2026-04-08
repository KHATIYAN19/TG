// import React, { useState, useEffect, useRef } from "react";
// import {
//   Menu,
//   X,
//   User,
//   LogOut,
//   ChevronDown,
//   Megaphone,
//   Users,
//   Edit3,
//   DollarSign,
//   Code,
//   Sparkles,
// } from "lucide-react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { logout } from "../Redux/authSlice";
// import logo from "../utils/target_Trek_logo_2.jpg";

// const services = [
//   { slug: "ppc-advertising", title: "PPC Advertising", icon: <Megaphone size={18} /> },
//   { slug: "social-media-marketing", title: "Social Media Marketing", icon: <Users size={18} /> },
//   { slug: "content-marketing", title: "Content Marketing", icon: <Edit3 size={18} /> },
//   { slug: "affiliate-marketing", title: "Affiliate Marketing", icon: <DollarSign size={18} /> },
//   { slug: "web-development", title: "Web Development", icon: <Code size={18} /> },
//   { slug: "genai-solutions", title: "GenAI Solutions", icon: <Sparkles size={18} /> },
// ];

// const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [servicesOpen, setServicesOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   const profileRef = useRef(null);

//   const isAdmin =
//     isAuthenticated && (user?.role === "admin" || user?.role === "Employee");

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/");
//     setProfileOpen(false);
//   };

//   /* ✅ CLOSE PROFILE WHEN CLICKING OUTSIDE */
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setProfileOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   /* ✅ CLOSE DROPDOWNS ON ROUTE CHANGE */
//   useEffect(() => {
//     setProfileOpen(false);
//     setServicesOpen(false);
//     setMenuOpen(false);
//   }, [location.pathname]);

//   return (
//     <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
//       <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

//         {/* LOGO */}
//         <NavLink to="/">
//           <img src={logo} alt="Logo" className="w-10" />
//         </NavLink>

//         {/* DESKTOP NAV */}
//         <ul className="hidden md:flex items-center gap-8 font-medium text-gray-700">

//           <NavLink to="/" className="hover:text-blue-600">
//             Home
//           </NavLink>

//           <NavLink to="/about" className="hover:text-blue-600">
//             About
//           </NavLink>

//           {/* SERVICES */}
//           <li
//             className="relative"
//             onMouseEnter={() => setServicesOpen(true)}
//             onMouseLeave={() => setServicesOpen(false)}
//           >
//             <NavLink
//               to="/services"
//               className="flex items-center gap-1 hover:text-blue-600"
//             >
//               Services
//               <ChevronDown
//                 size={16}
//                 className={`transition-transform ${
//                   servicesOpen ? "rotate-180" : ""
//                 }`}
//               />
//             </NavLink>

//             {servicesOpen && (
//               <div className="absolute top-12 left-0 w-72 bg-white shadow-xl rounded-xl border p-4">
//                 {services.map((service) => (
//                   <NavLink
//                     key={service.slug}
//                     to={`/services/${service.slug}`}
//                     className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
//                   >
//                     {service.icon}
//                     {service.title}
//                   </NavLink>
//                 ))}
//               </div>
//             )}
//           </li>

//           <NavLink to="/blogs" className="hover:text-blue-600">
//             Blogs
//           </NavLink>
//         </ul>

//         {/* RIGHT SIDE */}
//         <div className="flex items-center gap-3">

//           {/* PROFILE ICON (ALL DEVICES) */}
//           {isAuthenticated ? (
//             <div className="relative" ref={profileRef}>
//               <button
//                 onClick={() => setProfileOpen(!profileOpen)}
//                 className="p-2 rounded-full border hover:bg-gray-100"
//               >
//                 <User size={20} />
//               </button>

//               {profileOpen && (
//                 <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl border p-4">
//                   <div className="border-b pb-3 mb-3">
//                     <p className="font-semibold">{user?.name}</p>
//                     <p className="text-sm text-gray-500">
//                       {user?.email}
//                     </p>
//                   </div>

//                   <NavLink
//                     to="/profile"
//                     className="block px-3 py-2 rounded hover:bg-gray-100"
//                   >
//                     Profile
//                   </NavLink>

//                   {isAdmin && (
//                     <NavLink
//                       to="/dashboard"
//                       className="block px-3 py-2 rounded hover:bg-gray-100"
//                     >
//                       Dashboard
//                     </NavLink>
//                   )}

//                   <button
//                     onClick={handleLogout}
//                     className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded mt-2"
//                   >
//                     <LogOut size={16} className="inline mr-2" />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <NavLink
//               to="/contact"
//               className="hidden md:block bg-blue-600 text-white px-5 py-2 rounded-full"
//             >
//               Contact
//             </NavLink>
//           )}

//           {/* MOBILE MENU BUTTON */}
//           <button
//             onClick={() => setMenuOpen(!menuOpen)}
//             className="md:hidden"
//           >
//             {menuOpen ? <X /> : <Menu />}
//           </button>
//         </div>
//       </div>

//       {/* MOBILE MENU */}
//       {menuOpen && (
//         <div className="md:hidden bg-white border-t px-4 py-4 space-y-4">

//           <NavLink to="/" className="block">
//             Home
//           </NavLink>

//           <NavLink to="/about" className="block">
//             About
//           </NavLink>

//           <NavLink to="/blogs" className="block">
//             Blog
//           </NavLink>

//           {/* SERVICES MOBILE */}
//           <div>
//             <button
//               onClick={() => setServicesOpen(!servicesOpen)}
//               className="flex justify-between w-full"
//             >
//               Services
//               <ChevronDown
//                 size={16}
//                 className={`transition-transform ${
//                   servicesOpen ? "rotate-180" : ""
//                 }`}
//               />
//             </button>

//             {servicesOpen && (
//               <div className="pl-4 mt-2 space-y-2">
//                 {services.map((service) => (
//                   <NavLink
//                     key={service.slug}
//                     to={`/services/${service.slug}`}
//                     className="block text-gray-600"
//                   >
//                     {service.title}
//                   </NavLink>
//                 ))}
//               </div>
//             )}
//           </div>

//           {!isAuthenticated && (
//             <NavLink
//               to="/contact"
//               className="block bg-blue-600 text-white px-4 py-2 rounded-full text-center"
//             >
//               Contact
//             </NavLink>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;
import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Megaphone,
  Users,
  Edit3,
  DollarSign,
  Code,
  Sparkles,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Redux/authSlice";
import logo from "../utils/target_Trek_logo_2.jpg";

const services = [
  { slug: "ppc-advertising", title: "PPC Advertising", icon: <Megaphone size={18} /> },
  { slug: "social-media-marketing", title: "Social Media Marketing", icon: <Users size={18} /> },
  { slug: "content-marketing", title: "Content Marketing", icon: <Edit3 size={18} /> },
  { slug: "affiliate-marketing", title: "Affiliate Marketing", icon: <DollarSign size={18} /> },
  { slug: "web-development", title: "Web Development", icon: <Code size={18} /> },
  { slug: "genai-solutions", title: "GenAI Solutions", icon: <Sparkles size={18} /> },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const timeoutRef = useRef(null);

  const isAdmin =
    isAuthenticated && (user?.role === "admin" || user?.role === "Employee");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    setProfileOpen(false);
  };

  /* CLOSE PROFILE ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* CLOSE DROPDOWNS ON ROUTE CHANGE */
  useEffect(() => {
    setProfileOpen(false);
    setServicesOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  /* HOVER HANDLERS (NO FLICKER) */
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setServicesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 150);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* LOGO */}
        <NavLink to="/">
          <img src={logo} alt="Logo" className="w-10" />
        </NavLink>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex items-center gap-8 font-medium text-gray-700">

          <NavLink to="/" className="hover:text-blue-600">
            Home
          </NavLink>

          <NavLink to="/about" className="hover:text-blue-600">
            About
          </NavLink>

          {/* SERVICES */}
          <li
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <NavLink
              to="/services"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              Services
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  servicesOpen ? "rotate-180" : ""
                }`}
              />
            </NavLink>

            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white shadow-xl rounded-xl border p-4">
                {services.map((service) => (
                  <NavLink
                    key={service.slug}
                    to={`/services/${service.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                  >
                    {service.icon}
                    {service.title}
                  </NavLink>
                ))}
              </div>
            )}
          </li>

          <NavLink to="/blogs" className="hover:text-blue-600">
            Blogs
          </NavLink>

          {/* ✅ DASHBOARD LINK */}
          {isAdmin && (
            <NavLink to="/dashboard" className="hover:text-blue-600">
              Dashboard
            </NavLink>
          )}
        </ul>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* PROFILE */}
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="p-2 rounded-full border hover:bg-gray-100"
              >
                <User size={20} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl border p-4">
                  <div className="border-b pb-3 mb-3">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {user?.email}
                    </p>
                  </div>

                  <NavLink
                    to="/profile"
                    className="block px-3 py-2 rounded hover:bg-gray-100"
                  >
                    Profile
                  </NavLink>

                  {isAdmin && (
                    <NavLink
                      to="/dashboard"
                      className="block px-3 py-2 rounded hover:bg-gray-100"
                    >
                      Dashboard
                    </NavLink>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded mt-2"
                  >
                    <LogOut size={16} className="inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/contact"
              className="hidden md:block bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Contact
            </NavLink>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-4">

          <NavLink to="/" className="block">Home</NavLink>
          <NavLink to="/about" className="block">About</NavLink>
          <NavLink to="/blogs" className="block">Blog</NavLink>

          {/* DASHBOARD MOBILE */}
          {isAdmin && (
            <NavLink to="/dashboard" className="block">
              Dashboard
            </NavLink>
          )}

          {/* SERVICES MOBILE */}
          <div>
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="flex justify-between w-full"
            >
              Services
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  servicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {servicesOpen && (
              <div className="pl-4 mt-2 space-y-2">
                {services.map((service) => (
                  <NavLink
                    key={service.slug}
                    to={`/services/${service.slug}`}
                    className="block text-gray-600"
                  >
                    {service.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <NavLink
              to="/contact"
              className="block bg-blue-600 text-white px-4 py-2 rounded-full text-center"
            >
              Contact
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;