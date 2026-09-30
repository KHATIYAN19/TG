import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  Code,
  DollarSign,
  Edit3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Megaphone,
  Moon,
  Sparkles,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/authSlice";
import logo from "../utils/target_Trek_logo_2.jpg";

const THEME_KEY = "theme";
const NAV_MODE_KEY = "targettrek_nav_mode";
const THEME_EVENT = "targettrek-theme-change";

const services = [
  {
    slug: "ppc-advertising",
    title: "PPC Advertising",
    icon: Megaphone,
  },
  {
    slug: "social-media-marketing",
    title: "Social Media Marketing",
    icon: Users,
  },
  {
    slug: "content-marketing",
    title: "Content Marketing",
    icon: Edit3,
  },
  {
    slug: "affiliate-marketing",
    title: "Affiliate Marketing",
    icon: DollarSign,
  },
  {
    slug: "web-development",
    title: "Web Development",
    icon: Code,
  },
  {
    slug: "genai-solutions",
    title: "GenAI Solutions",
    icon: Sparkles,
  },
];

const LEARN_ROUTE_PREFIXES = [
  "/learn",
  "/blogs",
  "/blog",
  "/books",
  "/book",
  "/ebook",
  "/payment",
  "/resources",
  "/resource",
  "/interviews",
  "/interview",
];

const MAIN_ROUTE_PREFIXES = [
  "/about",
  "/services",
  "/contact",
  "/portfolio",
  "/affiliate-marketing",
  "/carrers",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/submit-review",
];

const CONTEXTUAL_ROUTE_PREFIXES = [
  "/profile",
  "/dashboard",
  "/admin",
  "/campaign",
  "/blog-manage",
  "/portfolio-manage",
  "/contact-query",
  "/contact-details",
  "/employee",
  "/clients",
  "/interest",
];

const routeMatches = (pathname, prefix) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const matchesAnyRoute = (pathname, prefixes) =>
  prefixes.some((prefix) => routeMatches(pathname, prefix));

const isLearnRoute = (pathname) =>
  matchesAnyRoute(pathname, LEARN_ROUTE_PREFIXES);

const isMainRoute = (pathname) =>
  pathname === "/" || matchesAnyRoute(pathname, MAIN_ROUTE_PREFIXES);

const isContextualRoute = (pathname) =>
  matchesAnyRoute(pathname, CONTEXTUAL_ROUTE_PREFIXES);

const readStoredNavMode = () => {
  if (typeof window === "undefined") {
    return "main";
  }

  return window.sessionStorage.getItem(NAV_MODE_KEY) === "learn"
    ? "learn"
    : "main";
};

const getNavbarMode = (pathname) => {
  if (isLearnRoute(pathname)) {
    return "learn";
  }

  if (isMainRoute(pathname)) {
    return "main";
  }

  if (isContextualRoute(pathname)) {
    return readStoredNavMode();
  }

  return "main";
};

const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem(THEME_KEY) === "dark"
    ? "dark"
    : "light";
};

const applyThemeToDocument = (theme) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle(
    "dark",
    theme === "dark"
  );

  document.documentElement.setAttribute(
    "data-theme",
    theme
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [navMode, setNavMode] = useState(() =>
    getNavbarMode(location.pathname)
  );

  const [theme, setTheme] = useState(readTheme);

  const profileRef = useRef(null);
  const servicesTimeoutRef = useRef(null);

  const isDark = theme === "dark";
  const isLearn = navMode === "learn";

  const isAdmin =
    isAuthenticated &&
    (
      user?.role === "admin" ||
      user?.role === "Employee"
    );

  const userInitial =
    user?.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "U";

  const saveNavMode = (mode) => {
    setNavMode(mode);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        NAV_MODE_KEY,
        mode
      );
    }
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setProfileOpen(false);
  };

  const goTo = (
    path,
    mode = navMode
  ) => {
    saveNavMode(mode);
    closeMenus();
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());

    closeMenus();

    navigate(
      navMode === "learn"
        ? "/learn"
        : "/"
    );
  };

  const changeTheme = (newTheme) => {
    if (
      newTheme !== "dark" &&
      newTheme !== "light"
    ) {
      return;
    }

    setTheme(newTheme);

    window.localStorage.setItem(
      THEME_KEY,
      newTheme
    );

    applyThemeToDocument(newTheme);

    window.dispatchEvent(
      new CustomEvent(
        THEME_EVENT,
        {
          detail: {
            theme: newTheme,
          },
        }
      )
    );
  };

  const toggleTheme = () => {
    changeTheme(
      isDark
        ? "light"
        : "dark"
    );
  };

  useEffect(() => {
    const initialTheme = readTheme();

    setTheme(initialTheme);

    applyThemeToDocument(
      initialTheme
    );

    const handleThemeEvent = (
      event
    ) => {
      const newTheme =
        event?.detail?.theme;

      if (
        newTheme === "dark" ||
        newTheme === "light"
      ) {
        setTheme(newTheme);

        applyThemeToDocument(
          newTheme
        );
      }
    };

    const handleStorage = (
      event
    ) => {
      if (
        event.key !== THEME_KEY
      ) {
        return;
      }

      if (
        event.newValue === "dark" ||
        event.newValue === "light"
      ) {
        setTheme(
          event.newValue
        );

        applyThemeToDocument(
          event.newValue
        );
      }
    };

    window.addEventListener(
      THEME_EVENT,
      handleThemeEvent
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeEvent
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  useEffect(() => {
    const pathname =
      location.pathname;

    const mode =
      getNavbarMode(
        pathname
      );

    setNavMode(mode);

    if (
      isLearnRoute(
        pathname
      )
    ) {
      window.sessionStorage.setItem(
        NAV_MODE_KEY,
        "learn"
      );
    } else if (
      isMainRoute(
        pathname
      )
    ) {
      window.sessionStorage.setItem(
        NAV_MODE_KEY,
        "main"
      );
    }

    setMenuOpen(false);
    setServicesOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow =
      menuOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (
        servicesTimeoutRef.current
      ) {
        clearTimeout(
          servicesTimeoutRef.current
        );
      }
    };
  }, []);

  const handleServicesEnter =
    () => {
      clearTimeout(
        servicesTimeoutRef.current
      );

      setServicesOpen(true);
    };

  const handleServicesLeave =
    () => {
      servicesTimeoutRef.current =
        setTimeout(() => {
          setServicesOpen(false);
        }, 150);
    };

  const isActive = (
    path
  ) =>
    routeMatches(
      location.pathname,
      path
    );

  const booksActive =
    isActive("/books") ||
    isActive("/book") ||
    isActive("/ebook");

  const interviewsActive =
    isActive("/interviews") ||
    isActive("/interview");

  const resourcesActive =
    isActive("/resources") ||
    isActive("/resource");

  const blogsActive =
    isActive("/blogs") ||
    isActive("/blog");

  const navBackground =
    isDark
      ? "border-slate-800 bg-[#090D14]/95"
      : "border-slate-200 bg-white/95";

  const drawerBackground =
    isDark
      ? "border-slate-800 bg-[#0B1119]"
      : "border-slate-200 bg-white";

  const primaryText =
    isDark
      ? "text-white"
      : "text-slate-950";

  const secondaryText =
    isDark
      ? "text-slate-400"
      : "text-slate-600";

  const cardBackground =
    isDark
      ? "border-slate-700 bg-slate-900"
      : "border-slate-200 bg-white";

  const desktopLinkClass = (
    active
  ) => {
    if (active) {
      return isDark
        ? "bg-blue-950/40 text-blue-300"
        : "bg-blue-50 text-blue-700";
    }

    return isDark
      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950";
  };

  const mobileLinkClass = (
    active
  ) => {
    if (active) {
      return isDark
        ? "bg-blue-950/40 text-blue-300"
        : "bg-blue-50 text-blue-700";
    }

    return isDark
      ? "text-slate-300 hover:bg-slate-800"
      : "text-slate-700 hover:bg-slate-100";
  };

  const Brand = ({
    mobile = false,
  }) => {
    if (!isLearn) {
      return (
        <button
          type="button"
          onClick={() =>
            goTo(
              "/",
              "main"
            )
          }
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Go to TargetTrek home"
        >
          <div
            className={`
              overflow-hidden
              rounded-xl
              border
              shadow-sm
              ${cardBackground}
              ${
                mobile
                  ? "h-9 w-9"
                  : "h-10 w-10"
              }
            `}
          >
            <img
              src={logo}
              alt="TargetTrek"
              className="h-full w-full object-cover"
            />
          </div>

          <span
            className={`
              font-extrabold
              tracking-tight
              ${primaryText}
              ${
                mobile
                  ? "text-lg"
                  : "text-xl"
              }
            `}
          >
            Target
            <span className="text-blue-500">
              Trek
            </span>
          </span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() =>
          goTo(
            "/learn",
            "learn"
          )
        }
        className="flex shrink-0 items-center gap-2.5"
        aria-label="Go to TargetTrek Learn home"
      >
        <div
          className={`
            overflow-hidden
            rounded-xl
            border
            ${cardBackground}
            ${
              mobile
                ? "h-9 w-9"
                : "h-10 w-10"
            }
          `}
        >
          <img
            src={logo}
            alt="TargetTrek Learn"
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className={`
            relative
            pb-1
            font-extrabold
            leading-none
            tracking-tight
            ${primaryText}
            ${
              mobile
                ? "text-lg"
                : "text-xl"
            }
          `}
        >
          Target
          <span className="text-blue-500">
            Trek
          </span>

          <span
            className="
              absolute
              -bottom-2
              right-0
              text-[8px]
              font-black
              uppercase
              tracking-[0.18em]
              text-blue-500
            "
          >
            Learn
          </span>
        </div>
      </button>
    );
  };

  const ThemeButton = () => (
    <button
      type="button"
      onClick={
        toggleTheme
      }
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className={`
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        transition
        ${
          isDark
            ? "border-slate-700 bg-slate-900 text-yellow-400 hover:bg-slate-800"
            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
        }
      `}
    >
      {isDark ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );

  const DesktopProfile =
    () => {
      if (
        !isAuthenticated
      ) {
        return null;
      }

      return (
        <div
          ref={profileRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (
                  previous
                ) =>
                  !previous
              )
            }
            aria-label="Open profile menu"
            className={`
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              text-sm
              font-black
              transition
              ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-blue-300 hover:border-blue-700"
                  : "border-slate-200 bg-slate-100 text-blue-700 hover:border-blue-300"
              }
            `}
          >
            {userInitial}
          </button>

          {profileOpen && (
            <div
              className={`
                absolute
                right-0
                top-full
                mt-3
                w-72
                overflow-hidden
                rounded-2xl
                border
                p-2
                shadow-2xl
                ${cardBackground}
              `}
            >
              <div
                className={`
                  rounded-xl
                  p-3
                  ${
                    isDark
                      ? "bg-slate-800"
                      : "bg-slate-50"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-600
                      font-black
                      text-white
                    "
                  >
                    {userInitial}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`
                        truncate
                        text-sm
                        font-black
                        ${primaryText}
                      `}
                    >
                      {user?.name ||
                        "User"}
                    </p>

                    <p
                      className={`
                        mt-0.5
                        truncate
                        text-xs
                        ${secondaryText}
                      `}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/profile"
                  )
                }
                className={`
                  mt-2
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-semibold
                  ${secondaryText}
                  ${
                    isDark
                      ? "hover:bg-slate-800"
                      : "hover:bg-slate-100"
                  }
                `}
              >
                <User size={17} />
                Profile
              </button>

              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        "/dashboard"
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-semibold
                      ${secondaryText}
                      ${
                        isDark
                          ? "hover:bg-slate-800"
                          : "hover:bg-slate-100"
                      }
                    `}
                  >
                    <LayoutDashboard
                      size={17}
                    />
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        "/admin/book/analytics"
                      )
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-semibold
                      ${secondaryText}
                      ${
                        isDark
                          ? "hover:bg-slate-800"
                          : "hover:bg-slate-100"
                      }
                    `}
                  >
                    <BarChart3
                      size={17}
                    />
                    Analytics
                  </button>
                </>
              )}

              <div
                className={`
                  my-2
                  border-t
                  ${
                    isDark
                      ? "border-slate-800"
                      : "border-slate-200"
                  }
                `}
              />

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className={`
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  font-semibold
                  text-red-500
                  ${
                    isDark
                      ? "hover:bg-red-950/30"
                      : "hover:bg-red-50"
                  }
                `}
              >
                <LogOut
                  size={17}
                />
                Logout
              </button>
            </div>
          )}
        </div>
      );
    };

  const MainDesktopNavigation =
    () => (
      <>
        <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          <NavLink
            to="/about"
            onClick={() =>
              saveNavMode(
                "main"
              )
            }
            className={`
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                isActive(
                  "/about"
                )
              )}
            `}
          >
            About
          </NavLink>

          <div
            className="relative"
            onMouseEnter={
              handleServicesEnter
            }
            onMouseLeave={
              handleServicesLeave
            }
          >
            <NavLink
              to="/services"
              onClick={() =>
                saveNavMode(
                  "main"
                )
              }
              className={`
                flex
                items-center
                gap-1.5
                rounded-lg
                px-4
                py-2
                text-sm
                font-semibold
                transition
                ${desktopLinkClass(
                  isActive(
                    "/services"
                  )
                )}
              `}
            >
              Services

              <ChevronDown
                size={15}
                className={`
                  transition-transform
                  ${
                    servicesOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </NavLink>

            {servicesOpen && (
              <div
                className={`
                  absolute
                  left-1/2
                  top-full
                  mt-2
                  w-80
                  -translate-x-1/2
                  rounded-2xl
                  border
                  p-2
                  shadow-2xl
                  ${cardBackground}
                `}
              >
                <p
                  className={`
                    px-3
                    pb-2
                    pt-2
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.15em]
                    ${
                      isDark
                        ? "text-slate-600"
                        : "text-slate-400"
                    }
                  `}
                >
                  Services
                </p>

                {services.map(
                  (
                    service
                  ) => {
                    const Icon =
                      service.icon;

                    return (
                      <NavLink
                        key={
                          service.slug
                        }
                        to={`/services/${service.slug}`}
                        onClick={() =>
                          saveNavMode(
                            "main"
                          )
                        }
                        className={`
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-sm
                          font-semibold
                          transition
                          ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-800 hover:text-blue-300"
                              : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            ${
                              isDark
                                ? "bg-slate-800"
                                : "bg-slate-100"
                            }
                          `}
                        >
                          <Icon
                            size={16}
                          />
                        </div>

                        {
                          service.title
                        }
                      </NavLink>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              goTo(
                "/learn",
                "learn"
              )
            }
            className={`
              flex
              items-center
              gap-2
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                false
              )}
            `}
          >
            <GraduationCap
              size={16}
            />
            Learn
          </button>
        </div>

        <div className="hidden items-center gap-1 xl:flex">
          <NavLink
            to="/contact"
            onClick={() =>
              saveNavMode(
                "main"
              )
            }
            className={`
              rounded-lg
              px-3
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                isActive(
                  "/contact"
                )
              )}
            `}
          >
            Contact
          </NavLink>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/dashboard",
                    "main"
                  )
                }
                className={`
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  transition
                  ${desktopLinkClass(
                    false
                  )}
                `}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/admin/book/analytics",
                    "main"
                  )
                }
                className={`
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  transition
                  ${desktopLinkClass(
                    false
                  )}
                `}
              >
                Analytics
              </button>
            </>
          )}

          <div className="ml-1">
            <ThemeButton />
          </div>

          <DesktopProfile />
        </div>
      </>
    );

  const LearnDesktopNavigation =
    () => (
      <>
        <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          <NavLink
            to="/books"
            onClick={() =>
              saveNavMode(
                "learn"
              )
            }
            className={`
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                booksActive
              )}
            `}
          >
            Books
          </NavLink>

          <NavLink
            to="/interviews"
            onClick={() =>
              saveNavMode(
                "learn"
              )
            }
            className={`
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                interviewsActive
              )}
            `}
          >
            Interviews
          </NavLink>

          <NavLink
            to="/resources"
            onClick={() =>
              saveNavMode(
                "learn"
              )
            }
            className={`
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                resourcesActive
              )}
            `}
          >
            Resources
          </NavLink>

          <NavLink
            to="/blogs"
            onClick={() =>
              saveNavMode(
                "learn"
              )
            }
            className={`
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                blogsActive
              )}
            `}
          >
            Blogs
          </NavLink>
        </div>

        <div className="hidden items-center gap-1 xl:flex">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/dashboard",
                    "learn"
                  )
                }
                className={`
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  transition
                  ${desktopLinkClass(
                    false
                  )}
                `}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/admin/book/analytics",
                    "learn"
                  )
                }
                className={`
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  transition
                  ${desktopLinkClass(
                    false
                  )}
                `}
              >
                Analytics
              </button>
            </>
          )}

          <div className="ml-1">
            <ThemeButton />
          </div>

          <DesktopProfile />
        </div>
      </>
    );

  const MobileTopBar =
    () => (
      <div
        className="
          grid
          h-16
          grid-cols-[40px_1fr_40px]
          items-center
          gap-3
          xl:hidden
        "
      >
        <button
          type="button"
          onClick={() =>
            setMenuOpen(
              true
            )
          }
          aria-label="Open menu"
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            ${cardBackground}
            ${primaryText}
          `}
        >
          <Menu size={20} />
        </button>

        <div className="flex justify-center">
          <Brand mobile />
        </div>

        <ThemeButton />
      </div>
    );

  const MainMobileNavigation =
    () => (
      <div className="space-y-1">
        <NavLink
          to="/about"
          onClick={() => {
            saveNavMode(
              "main"
            );

            closeMenus();
          }}
          className={`
            block
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              isActive(
                "/about"
              )
            )}
          `}
        >
          About
        </NavLink>

        <div>
          <button
            type="button"
            onClick={() =>
              setServicesOpen(
                (
                  previous
                ) =>
                  !previous
              )
            }
            className={`
              flex
              w-full
              items-center
              justify-between
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              ${mobileLinkClass(
                isActive(
                  "/services"
                )
              )}
            `}
          >
            Services

            <ChevronDown
              size={17}
              className={`
                transition-transform
                ${
                  servicesOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

          {servicesOpen && (
            <div
              className={`
                ml-4
                mt-1
                space-y-1
                border-l
                pl-3
                ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-200"
                }
              `}
            >
              <NavLink
                to="/services"
                onClick={() => {
                  saveNavMode(
                    "main"
                  );

                  closeMenus();
                }}
                className="
                  block
                  rounded-lg
                  px-3
                  py-2
                  text-xs
                  font-black
                  text-blue-500
                "
              >
                All Services
              </NavLink>

              {services.map(
                (
                  service
                ) => {
                  const Icon =
                    service.icon;

                  return (
                    <NavLink
                      key={
                        service.slug
                      }
                      to={`/services/${service.slug}`}
                      onClick={() => {
                        saveNavMode(
                          "main"
                        );

                        closeMenus();
                      }}
                      className={`
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        text-xs
                        font-semibold
                        ${secondaryText}
                        ${
                          isDark
                            ? "hover:bg-slate-800"
                            : "hover:bg-slate-100"
                        }
                      `}
                    >
                      <Icon
                        size={15}
                      />

                      {
                        service.title
                      }
                    </NavLink>
                  );
                }
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            goTo(
              "/learn",
              "learn"
            )
          }
          className={`
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              false
            )}
          `}
        >
          <span className="flex items-center gap-3">
            <GraduationCap
              size={18}
            />
            Learn
          </span>

          <ArrowUpRight
            size={16}
          />
        </button>

        <NavLink
          to="/contact"
          onClick={() => {
            saveNavMode(
              "main"
            );

            closeMenus();
          }}
          className={`
            block
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              isActive(
                "/contact"
              )
            )}
          `}
        >
          Contact
        </NavLink>
      </div>
    );

  const LearnMobileNavigation =
    () => (
      <div className="space-y-1">
        <NavLink
          to="/learn"
          onClick={() => {
            saveNavMode(
              "learn"
            );

            closeMenus();
          }}
          className={`
            flex
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              location.pathname ===
                "/learn"
            )}
          `}
        >
          <GraduationCap
            size={18}
          />

          Learn Home
        </NavLink>

        <NavLink
          to="/books"
          onClick={() => {
            saveNavMode(
              "learn"
            );

            closeMenus();
          }}
          className={`
            flex
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              booksActive
            )}
          `}
        >
          <BookOpen
            size={18}
          />

          Books
        </NavLink>

        <NavLink
          to="/interviews"
          onClick={() => {
            saveNavMode(
              "learn"
            );

            closeMenus();
          }}
          className={`
            flex
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              interviewsActive
            )}
          `}
        >
          <Users
            size={18}
          />

          Interviews
        </NavLink>

        <NavLink
          to="/resources"
          onClick={() => {
            saveNavMode(
              "learn"
            );

            closeMenus();
          }}
          className={`
            flex
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              resourcesActive
            )}
          `}
        >
          <GraduationCap
            size={18}
          />

          Resources
        </NavLink>

        <NavLink
          to="/blogs"
          onClick={() => {
            saveNavMode(
              "learn"
            );

            closeMenus();
          }}
          className={`
            flex
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              blogsActive
            )}
          `}
        >
          <FileText
            size={18}
          />

          Blogs
        </NavLink>
      </div>
    );

  const MobileAdmin =
    () => {
      if (!isAdmin) {
        return null;
      }

      return (
        <div
          className={`
            mt-6
            border-t
            pt-5
            ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }
          `}
        >
          <p
            className={`
              mb-2
              px-4
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              ${
                isDark
                  ? "text-slate-600"
                  : "text-slate-400"
              }
            `}
          >
            Administration
          </p>

          <button
            type="button"
            onClick={() =>
              goTo(
                "/dashboard"
              )
            }
            className={`
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              ${mobileLinkClass(
                location.pathname ===
                  "/dashboard"
              )}
            `}
          >
            <LayoutDashboard
              size={18}
            />

            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              goTo(
                "/admin/book/analytics"
              )
            }
            className={`
              mt-1
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              ${mobileLinkClass(
                location.pathname.startsWith(
                  "/admin/book/analytics"
                )
              )}
            `}
          >
            <BarChart3
              size={18}
            />

            Analytics
          </button>
        </div>
      );
    };

  const MobileProfile =
    () => {
      if (
        !isAuthenticated
      ) {
        return (
          <div
            className={`
              border-t
              p-4
              ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-200"
              }
            `}
          >
            {isLearn ? (
              <a
                href="mailto:supporttargettrek@gmail.com"
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  p-3
                  text-sm
                  font-semibold
                  ${
                    isDark
                      ? "bg-slate-900 text-slate-300"
                      : "bg-slate-50 text-slate-700"
                  }
                `}
              >
                <Mail
                  size={18}
                />

                Books & Support
              </a>
            ) : (
              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/contact",
                    "main"
                  )
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-3
                  text-sm
                  font-black
                  text-white
                "
              >
                Contact TargetTrek

                <ArrowRight
                  size={16}
                />
              </button>
            )}
          </div>
        );
      }

      return (
        <div
          className={`
            border-t
            p-4
            ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }
          `}
        >
          <div
            className={`
              rounded-2xl
              border
              p-4
              ${
                isDark
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-slate-50"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-600
                  font-black
                  text-white
                "
              >
                {userInitial}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`
                    truncate
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  {user?.name ||
                    "User"}
                </p>

                <p
                  className={`
                    mt-0.5
                    truncate
                    text-xs
                    ${secondaryText}
                  `}
                >
                  {user?.email}
                </p>

                {user?.role && (
                  <p
                    className="
                      mt-1
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-blue-500
                    "
                  >
                    {user.role}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  goTo(
                    "/profile"
                  )
                }
                className={`
                  rounded-xl
                  px-3
                  py-2.5
                  text-xs
                  font-bold
                  ${
                    isDark
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  }
                `}
              >
                Profile
              </button>

              <button
                type="button"
                onClick={
                  handleLogout
                }
                className={`
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-3
                  py-2.5
                  text-xs
                  font-bold
                  text-red-500
                  ${
                    isDark
                      ? "bg-red-950/20 hover:bg-red-950/40"
                      : "bg-red-50 hover:bg-red-100"
                  }
                `}
              >
                <LogOut
                  size={14}
                />

                Logout
              </button>
            </div>
          </div>
        </div>
      );
    };

  const MobileDrawer =
    () => (
      <>
        <div
          onClick={() =>
            setMenuOpen(
              false
            )
          }
          className={`
            fixed
            inset-0
            z-[70]
            bg-black/50
            backdrop-blur-[2px]
            transition-opacity
            duration-300
            xl:hidden
            ${
              menuOpen
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }
          `}
        />

        <aside
          className={`
            fixed
            bottom-0
            left-0
            top-0
            z-[80]
            flex
            w-[88vw]
            max-w-[360px]
            flex-col
            border-r
            shadow-2xl
            transition-transform
            duration-300
            ease-out
            xl:hidden
            ${drawerBackground}
            ${
              menuOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >
          <div
            className={`
              flex
              h-16
              shrink-0
              items-center
              justify-between
              border-b
              px-4
              ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-200"
              }
            `}
          >
            <Brand mobile />

            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              aria-label="Close menu"
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                ${secondaryText}
                ${
                  isDark
                    ? "hover:bg-slate-800"
                    : "hover:bg-slate-100"
                }
              `}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            <p
              className={`
                mb-3
                px-4
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                ${
                  isDark
                    ? "text-slate-600"
                    : "text-slate-400"
                }
              `}
            >
              {isLearn
                ? "Learning"
                : "Navigation"}
            </p>

            {isLearn ? (
              <LearnMobileNavigation />
            ) : (
              <MainMobileNavigation />
            )}

            <MobileAdmin />

            <div
              className={`
                mt-6
                border-t
                pt-5
                ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-200"
                }
              `}
            >
              {isLearn ? (
                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/",
                      "main"
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    ${mobileLinkClass(
                      false
                    )}
                  `}
                >
                  TargetTrek Website

                  <ArrowUpRight
                    size={16}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/learn",
                      "learn"
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-bold
                    ${
                      isDark
                        ? "bg-blue-950/30 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <GraduationCap
                      size={18}
                    />

                    TargetTrek Learn
                  </span>

                  <ArrowRight
                    size={16}
                  />
                </button>
              )}
            </div>
          </div>

          <MobileProfile />
        </aside>
      </>
    );

  return (
    <>
      <nav
        className={`
          fixed
          left-0
          top-0
          z-50
          w-full
          border-b
          backdrop-blur-xl
          transition-colors
          duration-300
          ${navBackground}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="hidden h-16 items-center xl:flex">
            <Brand />

            {isLearn ? (
              <LearnDesktopNavigation />
            ) : (
              <MainDesktopNavigation />
            )}
          </div>

          <MobileTopBar />
        </div>
      </nav>

      <MobileDrawer />
    </>
  );
};

export default Navbar;