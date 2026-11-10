import "./App.css";
import {
  lazy,
  Suspense,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import toast, {
  Toaster,
} from "react-hot-toast";
import axios from "axios";
import Base_url from "./utils/Url";
import {
  Analytics,
} from "@vercel/analytics/react";
import {
  logout,
} from "./Redux/authSlice.js";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer.jsx";
import {
  refreshAccessToken,
  tokenIsExpired,
  tokenExpiresAt,
} from "./lib/authSession";
/* ============================================================
   LAZY IMPORTS — PUBLIC PAGES
============================================================ */
const HomePage = lazy(() =>
  import("./component/HomePage")
);
const AboutPage = lazy(() =>
  import("./component/AboutPage")
);
const ContactPage = lazy(() =>
  import("./component/ContactPage")
);
const PortfolioPage = lazy(() =>
  import("./component/PortfolioPage")
);
const PortfolioDetailPage = lazy(() =>
  import("./component/PortfolioDetailPage")
);
const CareerPage = lazy(() =>
  import("./component/CareerPage.jsx")
);
const UserProfile = lazy(() =>
  import("./component/UserProfile.jsx")
);
const SaleCampaign = lazy(() =>
  import("./component/SaleCampaign.jsx")
);
const SubmitReviewPage = lazy(() =>
  import("./component/SumbitReviewPage")
);
const PrivacyPolicy = lazy(() =>
  import("./component/PrivacyPolicy.jsx")
);
const TermsOfService = lazy(() =>
  import("./component/TermsOfService.jsx")
);
const RefundPolicy = lazy(() =>
  import("./component/RefundPolicy.jsx")
);
const NotFoundPage = lazy(() =>
  import("./component/NotFoundPage")
);
/* ============================================================
   LEARN PAGES
============================================================ */
const LearnHome = lazy(() =>
  import("./component/LearnHome.jsx")
);
// const MentorshipPage = lazy(() =>
//   import("./component/MentorshipPage.jsx")
// );
const BlogPage = lazy(() =>
  import("./component/BlogPage")
);
const BlogPostDetail = lazy(() =>
  import("./component/BlogPostDetail")
);
const InterviewFeed = lazy(() =>
  import("./component/InterviewFeed.jsx")
);
const AddInterviewExperience = lazy(() =>
  import("./component/AddInterviewExperience.jsx")
);
const InterviewDetailPage = lazy(() =>
  import("./component/InterviewDetailPage.jsx")
);
const Resources = lazy(() =>
  import("./component/Resources.jsx")
);
const ArenaLanding = lazy(() =>
  import("./arena/ArenaLanding.jsx")
);
const ArenaAuth = lazy(() =>
  import("./arena/ArenaAuth.jsx")
);
const ArenaApp = lazy(() =>
  import("./arena/ArenaApp.jsx")
);
const AdminArena = lazy(() =>
  import("./arena/AdminArena.jsx")
);
const CampaignStudio = lazy(() =>
  import("./Admin/CampaignStudio.jsx")
);

const AdminMailSettings = lazy(() =>
  import("./Admin/AdminMailSettings.jsx")
);
const BookReview = lazy(() =>
  import("./component/BookReview")
);
const SetPassword = lazy(() =>
  import("./component/SetPassword.jsx")
);
/* ============================================================
   BOOK PAGES
============================================================ */
const BookCallPage = lazy(() =>
  import("./component/BookCallPage")
);
const Books = lazy(() =>
  import("./Ebooks/Books.jsx")
);
import BookMatchesNotice from "./Ebooks/BookMatchesNotice.jsx";
const AllAccess = lazy(() =>
  import("./Ebooks/AllAccess.jsx")
);
const AdminMembership = lazy(() =>
  import("./Admin/AdminMembership.jsx")
);
const AdminMemoryPages = lazy(() =>
  import("./Admin/AdminMemoryPages.jsx")
);
const MemoriesLanding = lazy(() =>
  import("./memories/MemoriesLanding.jsx")
);
const MemoriesAuth = lazy(() =>
  import("./memories/MemoriesAuth.jsx")
);
const MemoriesApp = lazy(() =>
  import("./memories/MemoriesApp.jsx")
);
const BirthdayPreview = lazy(() =>
  import("./memories/templates/birthday/BirthdayPreview.jsx")
);
const SorryPreview = lazy(() =>
  import("./memories/templates/sorry/SorryPreview.jsx")
);
const AnniversaryPreview = lazy(() =>
  import("./memories/templates/anniversary/AnniversaryPreview.jsx")
);
const ProposalPreview = lazy(() =>
  import("./memories/templates/proposal/ProposalPreview.jsx")
);
const ThanksPreview = lazy(() =>
  import("./memories/templates/thanks/ThanksPreview.jsx")
);
const MemoriesPaymentResult = lazy(() =>
  import("./memories/MemoriesPaymentResult.jsx")
);
/* Links made before the address changed (/m/<code>) keep working: they forward to /memories/<code>. */
function LegacyMemoryLink() {
  const { code } = useParams();
  return <Navigate to={`/memories/${code}`} replace />;
}
const MemoriesViewer = lazy(() =>
  import("./memories/MemoriesViewer.jsx")
);
const MemoriesTerms = lazy(() => import("./memories/legal/MemoriesTerms.jsx"));
const MemoriesPrivacy = lazy(() => import("./memories/legal/MemoriesPrivacy.jsx"));
const MemoriesRefund = lazy(() => import("./memories/legal/MemoriesRefund.jsx"));
const MemoriesContact = lazy(() => import("./memories/legal/MemoriesContact.jsx"));
const SystemDesignHLD = lazy(() =>
  import("./component/SystemDesignHLD.jsx")
);
const SystemDesignCombo = lazy(() =>
  import("./component/SystemDesignCombo.jsx")
);
const SystemDesignLLD = lazy(() =>
  import("./component/SystemDesignLLD.jsx")
);
const SqlInterviewHandbook = lazy(() =>
  import("./component/SqlInterviewHandbook.jsx")
);
const GcpHandbook = lazy(() =>
  import("./component/GcpHandbook.jsx")
);
const AwsHandbook = lazy(() =>
  import("./component/AwsHandbook.jsx")
);
const GenAiGoogleAdk = lazy(() =>
  import("./component/GenAiGoogleAdk.jsx")
);
const GenaiMCP = lazy(() =>
  import("./component/GenaiMCP.jsx")
);
const GenaiRAG = lazy(() =>
  import("./component/GenaiRAG.jsx")
);
const OperatingSystemBook = lazy(() =>
  import("./component/OperatingSystemBook.jsx")
);
const JavaInterviewHandbook = lazy(() =>
  import("./component/JavaInterviewHandbook.jsx")
);
const SpringBootInterviewHandbook = lazy(() =>
  import("./component/SpringBootInterviewHandbook.jsx")
);
const JavaBook = lazy(() =>
  import("./component/JavaBook.jsx")
);
/* ============================================================
   MOCK INTERVIEW — PUBLIC COMPONENTS
============================================================ */
const InterviewBookingPage = lazy(() =>
  import("./component/InterviewBookingPage.jsx")
);
const InterviewPaymentSuccessPage = lazy(() =>
  import("./component/InterviewPaymentPages").then(
    (module) => ({
      default:
        module.InterviewPaymentSuccessPage,
    })
  )
);
const InterviewPaymentFailedPage = lazy(() =>
  import("./component/InterviewPaymentPages").then(
    (module) => ({
      default:
        module.InterviewPaymentFailedPage,
    })
  )
);
const InterviewPaymentStatusPage = lazy(() =>
  import("./component/InterviewPaymentPages").then(
    (module) => ({
      default:
        module.InterviewPaymentStatusPage,
    })
  )
);
/* ============================================================
   HLD / API / SQL RESOURCES
============================================================ */
const HLDResources = lazy(() =>
  import("./hld/HLDResources.jsx")
);
const HLDCacheResource = lazy(() =>
  import("./hld/HLDCacheResource.jsx")
);
const HLDLoadBalancingResource = lazy(() =>
  import("./hld/HLDLoadBalancingResource.jsx")
);
const HLDDatabaseResource = lazy(() =>
  import("./hld/HLDDatabaseResource.jsx")
);
const HLDMessageQueueResource = lazy(() =>
  import("./hld/HLDMessageQueueResource.jsx")
);
const HLDRateLimitingResource = lazy(() =>
  import("./hld/HLDRateLimitingResource.jsx")
);
const HLDApiGatewayResource = lazy(() =>
  import("./hld/HLDApiGatewayResource.jsx")
);
const SQLResource = lazy(() =>
  import("./sql/SQLResource.jsx")
);
const APIResource = lazy(() =>
  import("./api/APIResource.jsx")
);
/* ============================================================
   PAYMENT PAGES
============================================================ */
const PaymentFailed = lazy(() =>
  import("./payment/paymentFailed.jsx")
);
const PaymentSuccess = lazy(() =>
  import("./payment/paymentSuccess.jsx")
);
/* ============================================================
   ADMIN IMPORTS
============================================================ */
const AdminBlogManagementPage = lazy(() =>
  import("./Admin/AdminBlogList")
);
const FinanceDashboard = lazy(() =>
  import("./Admin/FinanceDashboard.jsx")
);
const AdminBookingsPage = lazy(() =>
  import("./Admin/AdminBookingsPage")
);
// Mock interview booking administration
const InterviewAdminDashboard = lazy(() =>
  import("./Admin/InterviewAdminDashboard.jsx")
);
const AdminSlotsPage = lazy(() =>
  import("./Admin/AdminSlotsPage")
);
const AddBlogPage = lazy(() =>
  import("./Admin/AddBlogPage")
);
const BlogAgentPage = lazy(() =>
  import("./Admin/BlogAgentPage")
);
const LoginPage = lazy(() =>
  import("./Admin/LoginPage")
);
const GenerateReviewLinkPage = lazy(() =>
  import("./Admin/GenerateReview")
);
const ManageReviewsPage = lazy(() =>
  import("./Admin/ManageReviewPage")
);
const ContactList = lazy(() =>
  import("./Admin/ContactList")
);
const HowToSellEbook = lazy(() => 
  import("./component/HowToSellEbook.jsx")
);  
const ContactDetail = lazy(() =>
  import("./Admin/ContactDetails")
);
const AddPortfolioPage = lazy(() =>
  import("./Admin/AddPortfolioPage")
);
const ManagePortfolio = lazy(() =>
  import("./Admin/ManagePortFolio")
);
const AffiliateList = lazy(() =>
  import("./Admin/AffiliateList.jsx")
);
const InterestDashboard = lazy(() =>
  import("./Admin/InterestDashboard.jsx")
);
const AdminSignup = lazy(() =>
  import("./Admin/AdminSignup.jsx")
);
const ClientServices = lazy(() =>
  import("./Admin/ClientServices.jsx")
);
const AdminDailyPayments= lazy(() =>
  import("./Admin/AdminDailyPayments.jsx")    
);
const ServiceDetails = lazy(() =>
  import("./Admin/ServiceDetails.jsx")
);
const Clients = lazy(() =>
  import("./Admin/Clients.jsx")
);
const AdminDashboard = lazy(() =>
  import("./Admin/AdminDashBoard.jsx")
);
const UserManagement = lazy(() =>
  import("./Admin/UserManagement.jsx")
);
const EmployeeDetails = lazy(() =>
  import("./Admin/EmployeeDetails.jsx")
);
const SalesDashboard = lazy(() =>
  import("./Admin/SalesDashboard.jsx")
);
const BookSalesAnalytics = lazy(() =>
  import("./Admin/BookSalesAnalytics.jsx")
);
const WebsiteAnalytics = lazy(() =>
  import("./Admin/WebsiteAnalytics.jsx")
);
const AdminBooks = lazy(() =>
  import("./Admin/AdminBooks.jsx")
);
const AddBook = lazy(() =>
  import("./Admin/AddBook.jsx")
);
const AdminBookDetails = lazy(() =>
  import("./Admin/AdminBookDetails.jsx")
);
const AdminBookPayments = lazy(() =>
  import("./Admin/AdminBookPayments.jsx")
);
const AdminCouponDashboard = lazy(() =>
  import("./Admin/AdminCouponDashboard.jsx")
);
const CouponDetails = lazy(() =>
  import("./Admin/couponDetails.jsx")
);
const EmailCampaignDashboard = lazy(() =>
  import("./Admin/EmailCampaignDashboard.jsx")
);
// Interview experience content administration
const AdminInterviewDashboard = lazy(() =>
  import("./Admin/AdminInterviewDashboard.jsx")
);
const AdminInterviewEdit = lazy(() =>
  import("./Admin/AdminInterviewEdit.jsx")
);
const AdminBookReviews = lazy(() =>
  import("./Admin/AdminBookReviews.jsx")
);
/* ============================================================
   LOADER
============================================================ */
const RouteLoader = () => (
  <div className="flex min-h-screen w-full items-center justify-center px-4">
    <div className="flex flex-col items-center gap-4">
      <div
        className="
          h-9 w-9 animate-spin
          rounded-full border-[3px]
          border-orange-100
          border-t-orange-600
        "
      />
      <p className="text-sm font-semibold text-stone-500">
        Loading...
      </p>
    </div>
  </div>
);
/* ============================================================
   AUTHENTICATION HELPERS
============================================================ */
const LOGIN_URL = "/admin/login";
const API_ORIGIN = String(Base_url || "")
  .replace(/\/$/, "");
const ALLOWED_ROLES = [
  "admin",
  "Employee",
  "affiliate",
  "normal",
];
const ADMIN_ROLES = [
  "admin",
  "Employee",
];
let logoutInProgress = false;
function accessTokenExpired(token) {
  if (!token) return true;
  try {
    const part = token.split(".")[1];
    if (!part) return true;
    const base64 = part
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );
    const payload = JSON.parse(
      window.atob(padded)
    );
    return (
      typeof payload.exp !== "number" ||
      Date.now() >= payload.exp * 1000
    );
  } catch {
    return true;
  }
}
function destinationForRole(role) {
  return ADMIN_ROLES.includes(role)
    ? "/dashboard"
    : "/profile";
}
/*
  Retain the existing logout behavior.
  NOTE:
  Your current app clears all local/session storage.
  If other unrelated features rely on those stores,
  replace this with targeted auth-key removal.
*/
function removeStoredAuth() {
  const theme =
    localStorage.getItem("theme");
  const referralCode = localStorage.getItem("referralCode");
  localStorage.clear();
  sessionStorage.clear();
  if (theme) {
    localStorage.setItem("theme", theme);
  }
  if (referralCode) {
    localStorage.setItem("referralCode", referralCode);
  }
}
/* ============================================================
   PROTECTED ROUTE
   - JWT required
   - Valid JWT expiry required
   - User must exist in Redux
   - Role authorization required
   This is a frontend access guard.
   Backend endpoints must independently validate
   JWT, role, and account/session state.
============================================================ */
function ProtectedRoute({
  token,
  user,
  roles,
  children,
}) {
  const location = useLocation();
  if (
    !token ||
    accessTokenExpired(token) ||
    !user
  ) {
    return (
      <Navigate
        to={LOGIN_URL}
        replace
        state={{
          from: location,
        }}
      />
    );
  }
  if (!ALLOWED_ROLES.includes(user.role)) {
    return (
      <Navigate
        to={LOGIN_URL}
        replace
      />
    );
  }
  if (!roles.includes(user.role)) {
    return (
      <Navigate
        to={destinationForRole(user.role)}
        replace
      />
    );
  }
  return children;
}
/* ============================================================
   LOGIN ROUTE
============================================================ */
function PublicLoginRoute({
  token,
  user,
  children,
}) {
  if (
    token &&
    !accessTokenExpired(token) &&
    user &&
    ALLOWED_ROLES.includes(user.role)
  ) {
    return (
      <Navigate
        to={destinationForRole(user.role)}
        replace
      />
    );
  }
  return children;
}
/* ============================================================
   PAGE LAYOUT CONFIGURATION
   Add routes here when they should hide the navbar and/or footer.
   Supports exact paths and wildcard prefixes ending in /*.
============================================================ */
// Memories has its own header and footer (and is light-only), so the site chrome is hidden there.
const NO_NAVBAR_ROUTES = [
  "/others/book/how-to-sell-ebook",
  "/memories/*",
];
const NO_FOOTER_ROUTES = [
  "/others/book/how-to-sell-ebook",
  "/memories/*",
];
function matchesLayoutRoute(pathname, routes) {
  return routes.some((route) => {
    if (route.endsWith("/*")) {
      const prefix = route.slice(0, -2);
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    }
    return pathname === route;
  });
}
/* ============================================================
   APP
============================================================ */
function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const hideNavbar = matchesLayoutRoute(location.pathname, NO_NAVBAR_ROUTES);
  const hideFooter = matchesLayoutRoute(location.pathname, NO_FOOTER_ROUTES);
  const onMemories = location.pathname === "/memories" || location.pathname.startsWith("/memories/");
  // Capture referral codes globally for every frontend route.
  // Existing checkout continues reading localStorage.getItem("referralCode").
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referralCode = (
      params.get("referralCode") || params.get("ref") || ""
    ).trim();
    if (referralCode && /^[a-zA-Z0-9_-]{1,64}$/.test(referralCode)) {
      try {
        localStorage.setItem("referralCode", referralCode);
      } catch (error) {
        console.warn("Referral code could not be saved:", error);
      }
    }
  }, [location.search]);
  const token = useSelector(
    (state) => state.auth?.token
  );
  const user = useSelector(
    (state) => state.auth?.user
  );
  const forceSignOut = useCallback(
    (reason = "SESSION_EXPIRED") => {
      if (logoutInProgress) return;
      logoutInProgress = true;
      dispatch(logout());
      removeStoredAuth();
      sessionStorage.setItem(
        "authLogoutReason",
        reason
      );
      // Prep Buddy Arena members sign back in on the arena's own login
      // (and return to the page they were on), not the admin login.
      const onMemories =
        window.location.pathname.startsWith("/memories");
      const onArena =
        window.location.pathname.startsWith("/prep-buddy");
      if (
        onArena &&
        window.location.pathname.startsWith(
          "/prep-buddy/app"
        )
      ) {
        sessionStorage.setItem(
          "arena:returnTo",
          window.location.pathname +
            window.location.search
        );
      }
      if (onMemories) {
        // Memories visitors sign back in on the Memories login, and return to where they were.
        if (window.location.pathname.startsWith("/memories/app")) {
          sessionStorage.setItem(
            "memories:returnTo",
            window.location.pathname +
              window.location.search
          );
        }
        window.location.replace("/memories/login");
        return;
      }
      window.location.replace(
        onArena
          ? "/prep-buddy/signup?mode=login"
          : LOGIN_URL
      );
    },
    [dispatch]
  );
  /* ======================================================
     GLOBAL AXIOS AUTH FAILURE HANDLER
     Do not force logout for anonymous requests.
     Intercepts global axios only.
  ====================================================== */
  useEffect(() => {
    const interceptorId =
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          const status =
            error.response?.status;
          const code = String(
            error.response?.data?.code || ""
          ).toUpperCase();
          const url = String(
            error.config?.url || ""
          );
          const authHeader =
            error.config?.headers
              ?.Authorization ||
            error.config?.headers
              ?.authorization;
          const publicAuth = [
            "/api/auth/login",
            "/api/auth/verify-otp",
            "/api/auth/resend-otp",
            "/api/auth/password/setup",
            "/api/auth/refresh",
            "/api/auth/logout",
          ].some((path) =>
            url.includes(path)
          );
          const fromOurBackend =
            url.startsWith("/api/") ||
            Boolean(
              API_ORIGIN &&
              url.startsWith(API_ORIGIN)
            );
          const authenticationFailure =
            status === 401 ||
            (
              status === 403 &&
              [
                "ACCOUNT_BLOCKED",
                "ACCOUNT_SUSPENDED",
                "ACCOUNT_INACTIVE",
                "SESSION_REVOKED",
              ].includes(code)
            );
          // Expired access token (or the server lost its cached copy of the
          // session): try ONE silent refresh with the refresh cookie and replay
          // the request. Only sign out if the server says the session is gone.
          const recoverable =
            status === 401 &&
            ["TOKEN_EXPIRED", "SESSION_NOT_FOUND"].includes(code) &&
            authHeader &&
            fromOurBackend &&
            !publicAuth &&
            error.config &&
            !error.config._authRetried;
          if (recoverable) {
            error.config._authRetried = true;
            try {
              const fresh = await refreshAccessToken();
              error.config.headers.Authorization = `Bearer ${fresh}`;
              return axios.request(error.config);
            } catch (refreshError) {
              if (!refreshError.authRejected) {
                // Network hiccup: keep the user signed in, fail this call only.
                return Promise.reject(error);
              }
              forceSignOut("SESSION_EXPIRED");
              return Promise.reject(error);
            }
          }
          if (
            authenticationFailure &&
            authHeader &&
            fromOurBackend &&
            !publicAuth
          ) {
            forceSignOut(
              code || "SESSION_EXPIRED"
            );
          }
          return Promise.reject(error);
        }
      );
    return () => {
      axios.interceptors.response.eject(
        interceptorId
      );
    };
  }, [forceSignOut]);
  /* ======================================================
     TOKEN EXPIRY
     Public routes remain accessible without login.
     A signed-in user's access token is renewed quietly (shortly
     before it expires, after the tab wakes up, and on first load).
     They are only signed out if the server rejects the refresh.
  ====================================================== */
  const [authReady, setAuthReady] = useState(
    () => !token || !tokenIsExpired(token)
  );
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const renewIfNeeded = useCallback(
    async (skewMs = 0) => {
      const current = tokenRef.current;
      if (!current || !tokenIsExpired(current, skewMs)) return;
      try {
        await refreshAccessToken();
      } catch (refreshError) {
        if (refreshError.authRejected) {
          forceSignOut("TOKEN_EXPIRED");
        }
      }
    },
    [forceSignOut]
  );

  // First load with a stale token: renew BEFORE the route guards run,
  // otherwise they would bounce a still-valid session to the login page.
  useEffect(() => {
    if (authReady) return;
    renewIfNeeded().finally(() => setAuthReady(true));
  }, [authReady, renewIfNeeded]);

  useEffect(() => {
    if (!token) return undefined;
    const msLeft = tokenExpiresAt(token) - Date.now();
    const timer = setTimeout(
      () => renewIfNeeded(60_000),
      Math.max(5_000, msLeft - 60_000)
    );
    const onVisible = () => {
      if (document.visibilityState === "visible") renewIfNeeded(30_000);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
    };
  }, [token, renewIfNeeded]);
  useEffect(() => {
    if (location.pathname !== LOGIN_URL) {
      return;
    }
    const reason =
      sessionStorage.getItem(
        "authLogoutReason"
      );
    if (!reason) return;
    sessionStorage.removeItem(
      "authLogoutReason"
    );
    toast.error(
      reason === "SESSION_REVOKED"
        ? "Your session has been revoked. Please sign in again."
        : reason === "ACCOUNT_BLOCKED"
          ? "Your account has been blocked."
          : "Your session has expired. Please sign in again."
    );
  }, [location.pathname]);
  /* ======================================================
     ROUTE GUARDS
  ====================================================== */
  const requireUser = (element) => (
    <ProtectedRoute
      token={token}
      user={user}
      roles={ADMIN_ROLES}
    >
      {element}
    </ProtectedRoute>
  );
  const requireAdmin = (element) => (
    <ProtectedRoute
      token={token}
      user={user}
      roles={["admin"]}
    >
      {element}
    </ProtectedRoute>
  );
  const requireSignedIn = (element) => (
    <ProtectedRoute
      token={token}
      user={user}
      roles={ALLOWED_ROLES}
    >
      {element}
    </ProtectedRoute>
  );
  return (
    <div className="min-h-screen w-full overflow-x-hidden font-inter">
      <Toaster />
      <Analytics />
      {!hideNavbar && <Navbar />}
      {/* Book promos and sale popups are for the Target Trek store, not for Memories. */}
      {!onMemories && <BookMatchesNotice />}
      {!onMemories && (
        <Suspense fallback={null}>
          <SaleCampaign />
        </Suspense>
      )}
      <Suspense fallback={<RouteLoader />}>
        {!authReady ? <RouteLoader /> : <Routes>
          {/* ========================================
              PUBLIC PAGES
          ======================================== */}
          <Route
            path="/"
            element={<LearnHome />}
          />
          <Route
            path="/about"
            element={<AboutPage />}
          />
          <Route
            path="/contact"
            element={<ContactPage />}
          />
          <Route
            path="/portfolio"
            element={<PortfolioPage />}
          />
          <Route
            path="/portfolio/:slug"
            element={<PortfolioDetailPage />}
          />
          {/* <Route
            path="/carrers"
            element={<CareerPage />}
          /> */}
          <Route
            path="/profile"
            element={requireSignedIn(
              <UserProfile />
            )}
          />
          <Route
            path="/submit-review/:token"
            element={<SubmitReviewPage />}
          />
           <Route
            path="/others/book/how-to-sell-ebook"
            element={<HowToSellEbook />}
          />
          {/* ========================================
              LEGAL
          ======================================== */}
          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />
          <Route
            path="/terms-of-service"
            element={<TermsOfService />}
          />
          <Route
            path="/refund-policy"
            element={<RefundPolicy />}
          />
          {/* ========================================
              MOCK INTERVIEWS — PUBLIC
              No ProtectedRoute.
              No login redirect.
              No admin JWT required.
          ======================================== */}
          <Route
            path="/mock-interviews"
            element={<InterviewBookingPage />}
          />
          <Route
            path="/mock-interviews/success"
            element={
              <InterviewPaymentSuccessPage />
            }
          />
          <Route
            path="/mock-interviews/failed"
            element={
              <InterviewPaymentFailedPage />
            }
          />
          <Route
            path="/mock-interviews/payment-status"
            element={
              <InterviewPaymentStatusPage />
            }
          />
          {/* ========================================
              TARGET TREK LEARN
          ======================================== */}
          <Route
            path="/learn"
            element={<LearnHome />}
          />
          {/* <Route
            path="/mentorship"
            element={<MentorshipPage />}
          /> */}
          <Route
            path="/blogs"
            element={<BlogPage />}
          />
          <Route
            path="/blog/:slug"
            element={<BlogPostDetail />}
          />
          <Route
            path="/set-password"
            element={<SetPassword />}
          />
          <Route
            path="/review/:token"
            element={<BookReview />}
          />
          {/* Interview experiences */}
          <Route
            path="/interviews"
            element={<InterviewFeed />}
          />
          <Route
            path="/interview/create"
            element={<AddInterviewExperience />}
          />
          <Route
            path="/interview/:slug"
            element={<InterviewDetailPage />}
          />
          {/* ========================================
              PREP BUDDY ARENA
              Landing + signup are public. The member app
              redirects to signup/login when signed out, and
              every API call is authorised server-side.
          ======================================== */}
          {/* ========================================
              MEMORIES — public landing, login/signup,
              and the signed-in area. Light theme only,
              own header/footer (see NO_NAVBAR_ROUTES).
          ======================================== */}
          <Route
            path="/memories"
            element={<MemoriesLanding />}
          />
          <Route
            path="/memories/login"
            element={<MemoriesAuth />}
          />
          <Route
            path="/memories/signup"
            element={<MemoriesAuth />}
          />
          <Route path="/memories/terms" element={<MemoriesTerms />} />
          <Route path="/memories/privacy" element={<MemoriesPrivacy />} />
          <Route path="/memories/refund" element={<MemoriesRefund />} />
          <Route path="/memories/contact" element={<MemoriesContact />} />
          <Route
            path="/memories/:code"
            element={<MemoriesViewer />}
          />
          <Route
            path="/m/:code"
            element={<LegacyMemoryLink />}
          />
          <Route
            path="/memories/payment-result"
            element={<MemoriesPaymentResult />}
          />
          <Route
            path="/memories/app/*"
            element={<MemoriesApp />}
          />
          <Route
            path="/memories/preview/birthday"
            element={<BirthdayPreview />}
          />
          <Route
            path="/memories/preview/sorry"
            element={<SorryPreview />}
          />
          <Route
            path="/memories/preview/anniversary"
            element={<AnniversaryPreview />}
          />
          <Route
            path="/memories/preview/proposal"
            element={<ProposalPreview />}
          />
          <Route
            path="/memories/preview/thanks"
            element={<ThanksPreview />}
          />
          <Route
            path="/prep-buddy"
            element={<ArenaLanding />}
          />
          <Route
            path="/prep-buddy/signup"
            element={<ArenaAuth />}
          />
          <Route
            path="/prep-buddy/app/*"
            element={<ArenaApp />}
          />
          <Route
            path="/admin/arena"
            element={requireAdmin(
              <AdminArena />
            )}
          />
          <Route
            path="/admin/campaigns"
            element={requireAdmin(
              <CampaignStudio />
            )}
          />
          <Route
            path="/admin/mail"
            element={requireAdmin(
              <AdminMailSettings />
            )}
          />
          {/* ========================================
              RESOURCES
          ======================================== */}
          <Route
            path="/resources"
            element={<Resources />}
          />
          <Route
            path="/resources/hld"
            element={<HLDResources />}
          />
          <Route
            path="/resources/hld/cache"
            element={<HLDCacheResource />}
          />
          <Route
            path="/resources/hld/load-balancing"
            element={
              <HLDLoadBalancingResource />
            }
          />
          <Route
            path="/resources/hld/database"
            element={<HLDDatabaseResource />}
          />
          <Route
            path="/resources/hld/message-queue"
            element={
              <HLDMessageQueueResource />
            }
          />
          <Route
            path="/resources/hld/rate-limiting"
            element={
              <HLDRateLimitingResource />
            }
          />
          <Route
            path="/resources/hld/api-gateway"
            element={
              <HLDApiGatewayResource />
            }
          />
          <Route
            path="/resources/sql"
            element={<SQLResource />}
          />
          <Route
            path="/resources/apis"
            element={<APIResource />}
          />
          {/* ========================================
              BOOKS
          ======================================== */}
          <Route
            path="/book"
            element={<Books />}
          />
          <Route
            path="/books"
            element={<Books />}
          />
          <Route
            path="/book/all-books"
            element={<AllAccess />}
          />
          <Route
            path="/book/life-type-combo"
            element={<AllAccess />}
          />
          <Route
            path="/book/system-design/hld"
            element={<SystemDesignHLD />}
          />
          <Route 
          path="/book/java-interview-handbook"
          element={<JavaInterviewHandbook />}
          />
          <Route
            path="/book/springboot-interview-handbook"
            element={<SpringBootInterviewHandbook />}
          />
          <Route
            path="/book/system-design/hld-lld/combo"
            element={<SystemDesignCombo />}
          />
          <Route
            path="/book/system-design/lld"
            element={<SystemDesignLLD />}
          />
          <Route
            path="/book/cloud/aws"
            element={<AwsHandbook />}
          />
          <Route
            path="/book/cloud/gcp"
            element={<GcpHandbook />}
          />
          <Route
            path="/book/database/sql"
            element={<SqlInterviewHandbook />}
          />
          <Route
            path="/book/genai/google-adk"
            element={<GenAiGoogleAdk />}
          />
          <Route
            path="/book/genai/mcp"
            element={<GenaiMCP />}
          />
          <Route
            path="/book/genai/rag"
            element={<GenaiRAG />}
          />
          <Route
            path="/books/operating-systems"
            element={<OperatingSystemBook />}
          />
          {/* <Route
            path="/book/language/java"
            element={<JavaBook />}
          /> */}
          {/* ========================================
              BOOK PAYMENTS — PUBLIC
          ======================================== */}
          <Route
            path="/payment/success"
            element={<PaymentSuccess />}
          />
          <Route
            path="/payment/failed"
            element={<PaymentFailed />}
          />
          {/* ========================================
              AUTH ROUTES
          ======================================== */}
          <Route
            path="/admin/login"
            element={
              <PublicLoginRoute
                token={token}
                user={user}
              >
                <LoginPage />
              </PublicLoginRoute>
            }
          />
          <Route
            path="/admin/signup"
            element={requireAdmin(
              <AdminSignup />
            )}
          />
          {/* ========================================
              ADMIN DASHBOARD
          ======================================== */}
          <Route
            path="/dashboard"
            element={requireUser(
              <AdminDashboard />
            )}
          />
          <Route
            path="/admin/dashboard"
            element={requireAdmin(
              <SalesDashboard />
            )}
          />
          <Route
            path="/campaign"
            element={requireUser(
              <EmailCampaignDashboard />
            )}
          />
          {/* ========================================
              MOCK INTERVIEW ADMIN — PRIVATE
              Accessible only to:
              - admin
              - Employee
              Sends authToken to the component.
          ======================================== */}
          <Route
            path="/admin/mock-interviews"
            element={requireUser(
              <InterviewAdminDashboard
                authToken={token}
              />
            )}
          />
            <Route
            path="/admin/daily-payments"
            element={requireUser(
              <AdminDailyPayments
                authToken={token}
              />
            )}
          />
          {/* ========================================
              INTERVIEW EXPERIENCE ADMIN — PRIVATE
              Kept on separate routes to avoid
              conflicting with booking administration.
          ======================================== */}
          <Route
            path="/admin/interview-experiences"
            element={requireUser(
              <AdminInterviewDashboard />
            )}
          />
          <Route
            path="/admin/interviews"
            element={requireUser(
              <AdminInterviewDashboard />
            )}
          />
          <Route
            path="/admin/interviews/:id"
            element={requireUser(
              <AdminInterviewEdit />
            )}
          />
          {/* <Route
            path="/admin/interview-experiences/:id"
            element={requireUser(
              <AdminInterviewEdit />
            )}
          /> */}
          {/* ========================================
              ADMIN BOOKS
          ======================================== */}
          <Route
            path="/admin/books"
            element={requireAdmin(
              <AdminBooks />
            )}
          />
          <Route
            path="/admin/membership"
            element={requireAdmin(
              <AdminMembership />
            )}
          />
          <Route
            path="/admin/memories"
            element={requireAdmin(
              <AdminMemoryPages />
            )}
          />
          <Route
            path="/admin/book/create"
            element={requireAdmin(
              <AddBook />
            )}
          />
          <Route
            path="/admin/book/analytics"
            element={requireAdmin(
              <BookSalesAnalytics />
            )}
          />
          <Route
            path="/admin/website-analytics"
            element={requireAdmin(
              <WebsiteAnalytics />
            )}
          />
          <Route
            path="/admin/book/:bookId/payments"
            element={requireAdmin(
              <AdminBookPayments />
            )}
          />
          <Route
            path="/admin/book/:bookId/reviews"
            element={requireAdmin(
              <AdminBookReviews />
            )}
          />
          <Route
            path="/admin/book/:bookId"
            element={requireAdmin(
              <AdminBookDetails />
            )}
          />
          {/* ========================================
              COUPONS
          ======================================== */}
          <Route
            path="/admin/coupon/dashboard"
            element={requireAdmin(
              <AdminCouponDashboard />
            )}
          />
          <Route
            path="/admin/coupon/:id"
            element={requireAdmin(
              <CouponDetails />
            )}
          />
          {/* ========================================
              BLOG ADMIN
          ======================================== */}
          <Route
            path="/admin/add-blog"
            element={requireUser(
              <AddBlogPage />
            )}
          />
          <Route
            path="/admin/blog-agent"
            element={requireAdmin(
              <BlogAgentPage />
            )}
          />
          <Route
            path="/blog-manage"
            element={requireUser(
              <AdminBlogManagementPage />
            )}
          />
          {/* ========================================
              REVIEW ADMIN
          ======================================== */}
          <Route
            path="/admin/generate-review-link"
            element={requireUser(
              <GenerateReviewLinkPage />
            )}
          />
          <Route
            path="/admin/manage-reviews"
            element={requireUser(
              <ManageReviewsPage />
            )}
          />
          {/* ========================================
              PORTFOLIO ADMIN
          ======================================== */}
          <Route
            path="/admin/add-portfolio"
            element={requireUser(
              <AddPortfolioPage />
            )}
          />
          <Route
            path="/portfolio-manage"
            element={requireUser(
              <ManagePortfolio />
            )}
          />
          {/* ========================================
              CONTACT ADMIN
          ======================================== */}
          <Route
            path="/contact-query"
            element={requireUser(
              <ContactList />
            )}
          />
          <Route
            path="/contact-details/:id"
            element={requireUser(
              <ContactDetail />
            )}
          />
          {/* ========================================
              USERS
          ======================================== */}
          <Route
            path="/admin/users"
            element={requireAdmin(
              <UserManagement />
            )}
          />
          <Route
            path="/employee/:email"
            element={requireAdmin(
              <EmployeeDetails />
            )}
          />
          {/* ========================================
              MOCK INTERVIEW BOOKINGS AND SLOTS
              ADMIN ONLY
          ======================================== */}
          {/* <Route
            path="/admin/booking"
            element={requireAdmin(
              <AdminBookingsPage />
            )}
          /> */}
          {/* <Route
            path="/admin/slots"
            element={requireAdmin(
              <AdminSlotsPage />
            )}
          /> */}
          {/* ========================================
              AFFILIATE ADMIN
          ======================================== */}
          <Route
            path="/admin/affiliate-manage"
            element={requireUser(
              <AffiliateList />
            )}
          />
          {/* ========================================
              CLIENTS
          ======================================== */}
          <Route
            path="/clients"
            element={requireAdmin(
              <Clients />
            )}
          />
          <Route
            path="/admin/finance"
            element={requireAdmin(
              <FinanceDashboard />
            )}
          />
          <Route
            path="/clients/:clientId/services"
            element={requireAdmin(
              <ClientServices />
            )}
          />
          <Route
            path="/clients/:clientId/services/:serviceId"
            element={requireAdmin(
              <ServiceDetails />
            )}
          />
          {/* ========================================
              INTERESTED USERS
          ======================================== */}
          <Route
            path="/interest"
            element={requireAdmin(
              <InterestDashboard />
            )}
          />
          {/* ========================================
              404
          ======================================== */}
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>}
        {/* Inside the boundary: while a lazy page loads, React hides the footer
            too, so users never see (or get scrolled to) a footer-only screen. */}
        {!hideFooter && <Footer />}
      </Suspense>
    </div>
  );
}
export default App;
