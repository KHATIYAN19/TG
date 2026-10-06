// import "./App.css";

// import { useEffect } from "react";
// import {
//   Route,
//   Routes,
// } from "react-router-dom";
// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";
// import toast, {
//   Toaster,
// } from "react-hot-toast";
// import {
//   Analytics,
// } from "@vercel/analytics/react";

// import {
//   getTokenExpiryFromLocalStorage,
//   logout,
// } from "./Redux/authSlice.js";

// import Navbar from "./component/Navbar";
// import Footer from "./component/Footer.jsx";

// import HomePage from "./component/HomePage";
// import AboutPage from "./component/AboutPage";
// import ServicesPage from "./component/ServicesPage";
// import ContactPage from "./component/ContactPage";
// import PortfolioPage from "./component/PortfolioPage";
// import PortfolioDetailPage from "./component/PortfolioDetailPage";
// import AffiliateMarketing from "./component/AffiliateMarketing";
// import CareerPage from "./component/CareerPage.jsx";
// import UserProfile from "./component/UserProfile.jsx";
// import SubmitReviewPage from "./component/SumbitReviewPage";
// import PrivacyPolicy from "./component/PrivacyPolicy.jsx";
// import TermsOfService from "./component/TermsOfService.jsx";
// import RefundPolicy from "./component/RefundPolicy.jsx";
// import NotFoundPage from "./component/NotFoundPage";

// import GenAIServicesPage from "./Services/GenAIServicesPage.jsx";
// import WebDevelopmentPage from "./Services/WebDevelopmentPage.jsx";
// import PPCAdvertisingPage from "./Services/PPCAdvertisingPage.jsx";
// import SocialMediaMarketingPage from "./Services/SocialMediaMarketingPage.jsx";
// import ContentMarketingPage from "./Services/ContentMarketingPage.jsx";
// import AffiliateMarketingPage from "./Services/AffiliateMarketingPage.jsx";

// import LearnHome from "./component/LearnHome.jsx";
// import BlogPage from "./component/BlogPage";
// import BlogPostDetail from "./component/BlogPostDetail";
// import InterviewFeed from "./component/InterviewFeed.jsx";
// import AddInterviewExperience from "./component/AddInterviewExperience.jsx";
// import InterviewDetailPage from "./component/InterviewDetailPage.jsx";
// import Resources from "./component/Resources.jsx";

// import BookCallPage from "./component/BookCallPage";
// import Books from "./Ebooks/Books.jsx";
// import SystemDesignHLD from "./component/SystemDesignHLD.jsx";
// import SystemDesignLLD from "./component/SystemDesignLLD.jsx";
// import GenAiGoogleAdk from "./component/GenAiGoogleAdk.jsx";
// import GenaiMCP from "./component/GenaiMCP.jsx";
// import GenaiRAG from "./component/GenaiRAG.jsx";

// import HLDResources from "./hld/HLDResources.jsx";
// import HLDCacheResource from "./hld/HLDCacheResource.jsx";
// import HLDLoadBalancingResource from "./hld/HLDLoadBalancingResource.jsx";
// import HLDDatabaseResource from "./hld/HLDDatabaseResource.jsx";
// import HLDMessageQueueResource from "./hld/HLDMessageQueueResource.jsx";
// import HLDRateLimitingResource from "./hld/HLDRateLimitingResource.jsx";
// import HLDApiGatewayResource from "./hld/HLDApiGatewayResource.jsx";

// import PaymentFailed from "./payment/paymentFailed.jsx";
// import PaymentSuccess from "./payment/paymentSuccess.jsx";

// import AdminBlogManagementPage from "./Admin/AdminBlogList";
// import AdminBookingsPage from "./Admin/AdminBookingsPage";
// import AdminSlotsPage from "./Admin/AdminSlotsPage";
// import AddBlogPage from "./Admin/AddBlogPage";
// import LoginPage from "./Admin/LoginPage";
// import GenerateReviewLinkPage from "./Admin/GenerateReview";
// import ManageReviewsPage from "./Admin/ManageReviewPage";
// import ContactList from "./Admin/ContactList";
// import ContactDetail from "./Admin/ContactDetails";
// import AddPortfolioPage from "./Admin/AddPortfolioPage";
// import ManagePortfolio from "./Admin/ManagePortFolio";
// import AffiliateList from "./Admin/AffiliateList.jsx";
// import InterestDashboard from "./Admin/InterestDashboard.jsx";
// import AdminSignup from "./Admin/AdminSignup.jsx";
// import ClientServices from "./Admin/ClientServices.jsx";
// import ServiceDetails from "./Admin/ServiceDetails.jsx";
// import Clients from "./Admin/Clients.jsx";
// import AdminDashboard from "./Admin/AdminDashBoard.jsx";
// import UserManagement from "./Admin/UserManagement.jsx";
// import EmployeeDetails from "./Admin/EmployeeDetails.jsx";
// import SalesDashboard from "./Admin/SalesDashboard.jsx";
// import BookSalesAnalytics from "./Admin/BookSalesAnalytics.jsx";
// import AdminBooks from "./Admin/AdminBooks.jsx";
// import AddBook from "./Admin/AddBook.jsx";
// import AdminBookDetails from "./Admin/AdminBookDetails.jsx";
// import AdminBookPayments from "./Admin/AdminBookPayments.jsx";
// import AdminCouponDashboard from "./Admin/AdminCouponDashboard.jsx";
// import CouponDetails from "./Admin/couponDetails.jsx";
// import EmailCampaignDashboard from "./Admin/EmailCampaignDashboard.jsx";
// import AdminInterviewDashboard from "./Admin/AdminInterviewDashboard.jsx";
// import AdminInterviewEdit from "./Admin/AdminInterviewEdit.jsx";
// import SQLResource from "./sql/SQLResource.jsx";
// import APIResource from "./api/APIResource.jsx";
// import BookReview from "./component/BookReview";

// import AdminBookReviews from "./Admin/AdminBookReviews.jsx";

// function App() {
//   const dispatch =
//     useDispatch();

//   const user =
//     useSelector(
//       (state) =>
//         state.auth.user
//     );

//   const isAdmin =
//     user?.role === "admin";

//   const isEmployee =
//     user?.role === "Employee";

//   const isUser =
//     isAdmin ||
//     isEmployee;

//   useEffect(() => {
//     const checkTokenExpiry =
//       () => {
//         const expiry =
//           getTokenExpiryFromLocalStorage();

//         if (
//           expiry &&
//           Date.now() >
//             expiry
//         ) {
//           dispatch(
//             logout()
//           );

//           toast.error(
//             "Session expired. You have been logged out."
//           );
//         }
//       };

//     checkTokenExpiry();

//     const intervalId =
//       setInterval(
//         checkTokenExpiry,
//         5000
//       );

//     return () =>
//       clearInterval(
//         intervalId
//       );
//   }, [dispatch]);

//   const requireUser = (
//     element
//   ) =>
//     isUser
//       ? element
//       : <NotFoundPage />;

//   const requireAdmin = (
//     element
//   ) =>
//     isAdmin
//       ? element
//       : <NotFoundPage />;

//   return (
//     <div
//       className="
//         min-h-screen
//         w-full
//         overflow-x-hidden
//         font-inter
//       "
//     >
//       <Toaster />

//       <Analytics />

//       <Navbar />

//       <Routes>
//         {/* ============================================================ */}
//         {/* NORMAL TARGET TREK */}
//         {/* ============================================================ */}

//         <Route
//           path="/"
//           element={
//             <LearnHome />
//           }
//         />

//         <Route
//           path="/about"
//           element={
//             <AboutPage />
//           }
//         />

//         <Route
//           path="/contact"
//           element={
//             <ContactPage />
//           }
//         />

//         <Route
//           path="/portfolio"
//           element={
//             <PortfolioPage />
//           }
//         />

//         <Route
//           path="/portfolio/:slug"
//           element={
//             <PortfolioDetailPage />
//           }
//         />

//         <Route
//           path="/affiliate-marketing"
//           element={
//             <AffiliateMarketing />
//           }
//         />

//         <Route
//           path="/carrers"
//           element={
//             <CareerPage />
//           }
//         />

//         <Route
//           path="/profile"
//           element={
//             <UserProfile />
//           }
//         />

//         <Route
//           path="/submit-review/:token"
//           element={
//             <SubmitReviewPage />
//           }
//         />

//         {/* Legal */}

//         <Route
//           path="/privacy-policy"
//           element={
//             <PrivacyPolicy />
//           }
//         />

//         <Route
//           path="/terms-of-service"
//           element={
//             <TermsOfService />
//           }
//         />

//         <Route
//           path="/refund-policy"
//           element={
//             <RefundPolicy />
//           }
//         />

//         {/* Services */}
// {/* 
//         <Route
//           path="/services"
//           element={
//             <ServicesPage />
//           }
//         />

//         <Route
//           path="/services/genai-solutions"
//           element={
//             <GenAIServicesPage />
//           }
//         />

//         <Route
//           path="/services/web-development"
//           element={
//             <WebDevelopmentPage />
//           }
//         />

//         <Route
//           path="/services/ppc-advertising"
//           element={
//             <PPCAdvertisingPage />
//           }
//         />

//         <Route
//           path="/services/social-media-marketing"
//           element={
//             <SocialMediaMarketingPage />
//           }
//         />

//         <Route
//           path="/services/content-marketing"
//           element={
//             <ContentMarketingPage />
//           }
//         />

//         <Route
//           path="/services/affiliate-marketing"
//           element={
//             <AffiliateMarketingPage />
//           }
//         /> */}

//         {/* ============================================================ */}
//         {/* TARGET TREK LEARN */}
//         {/* ============================================================ */}

//         <Route
//           path="/learn"
//           element={
//             <LearnHome />
//           }
//         />

//         {/* Blogs - Learn only */}

//         <Route
//           path="/blogs"
//           element={
//             <BlogPage />
//           }
//         />
//         <Route
//         path="/review/:token"
//         element={<BookReview />}
//       />

//         <Route
//           path="/blog/:slug"
//           element={
//             <BlogPostDetail />
//           }
//         />

//         {/* Interviews */}

//         <Route
//           path="/interviews"
//           element={
//             <InterviewFeed />
//           }
//         />

//         <Route
//           path="/interview/:slug"
//           element={
//             <InterviewDetailPage />
//           }
//         />

//         <Route
//           path="/interview/create"
//           element={
//             <AddInterviewExperience />
//           }
//         />

//         {/* Resources */}

//         <Route
//           path="/resources"
//           element={
//             <Resources />
//           }
//         />

//         <Route
//           path="/resources/hld"
//           element={
//             <HLDResources />
//           }
//         />

//         <Route
//           path="/resources/hld/cache"
//           element={
//             <HLDCacheResource />
//           }
//         />

//         <Route
//           path="/resources/hld/load-balancing"
//           element={
//             <HLDLoadBalancingResource />
//           }
//         />

//         <Route
//           path="/resources/hld/database"
//           element={
//             <HLDDatabaseResource />
//           }
//         />

//         <Route
//           path="/resources/hld/message-queue"
//           element={
//             <HLDMessageQueueResource />
//           }
//         />

//         <Route
//           path="/resources/hld/rate-limiting"
//           element={
//             <HLDRateLimitingResource />
//           }
//         />

//         <Route
//           path="/resources/hld/api-gateway"
//           element={
//             <HLDApiGatewayResource />
//           }
//         />
//         <Route
//           path="/resources/sql"
//           element={
//             <SQLResource />
//           }
//         />

//         <Route
//           path="/resources/apis"
//           element={
//             <APIResource />
//           }
//         />

//         {/* Books */}

//         <Route
//           path="/book"
//           element={
//             <BookCallPage />
//           }
//         />

//         <Route
//           path="/books"
//           element={
//             <Books />
//           }
//         />

//         <Route
//           path="/book/system-design/hld"
//           element={
//             <SystemDesignHLD />
//           }
//         />

//         <Route
//           path="/book/system-design/lld"
//           element={
//             <SystemDesignLLD />
//           }
//         />

//         <Route
//           path="/book/genai/google-adk"
//           element={
//             <GenAiGoogleAdk />
//           }
//         />

//         <Route
//           path="/book/genai/mcp"
//           element={
//             <GenaiMCP />
//           }
//         />

//         <Route
//           path="/book/genai/rag"
//           element={
//             <GenaiRAG />
//           }
//         />

//         {/* Payment routes belong to Learn purchases */}

//         <Route
//           path="/payment/success"
//           element={
//             <PaymentSuccess />
//           }
//         />

//         <Route
//           path="/payment/failed"
//           element={
//             <PaymentFailed />
//           }
//         />

//         {/* ============================================================ */}
//         {/* ADMIN / INTERNAL ROUTES */}
//         {/* ============================================================ */}

//         {/* Admin Auth */}

//         <Route
//           path="/admin/login"
//           element={
//             !isUser
//               ? <LoginPage />
//               : <HomePage />
//           }
//         />

//         <Route
//           path="/admin/signup"
//           element={
//             isAdmin
//               ? <AdminSignup />
//               : <HomePage />
//           }
//         />

//         {/* Main Admin */}

//         <Route
//           path="/dashboard"
//           element={requireUser(
//             <AdminDashboard />
//           )}
//         />

//         <Route
//           path="/admin/dashboard"
//           element={requireAdmin(
//             <SalesDashboard />
//           )}
//         />

//         <Route
//           path="/campaign"
//           element={requireUser(
//             <EmailCampaignDashboard />
//           )}
//         />

//         {/* Admin Interviews */}

//         <Route
//           path="/admin/interviews"
//           element={requireUser(
//             <AdminInterviewDashboard />
//           )}
//         />

//         <Route
//           path="/admin/interviews/:id"
//           element={requireUser(
//             <AdminInterviewEdit />
//           )}
//         />

//         {/* Admin Books */}

//         <Route
//           path="/admin/books"
//           element={requireAdmin(
//             <AdminBooks />
//           )}
//         />

//         <Route
//           path="/admin/book/create"
//           element={requireAdmin(
//             <AddBook />
//           )}
//         />

//         <Route
//           path="/admin/book/analytics"
//           element={requireAdmin(
//             <BookSalesAnalytics />
//           )}
//         />

//         <Route
//           path="/admin/book/:bookId/payments"
//           element={requireAdmin(
//             <AdminBookPayments />
//           )}
//         />
//         <Route
//           path="/admin/book/:bookId/reviews"
//           element={requireAdmin(
//             <AdminBookReviews />
//           )}
//         />

//         <Route
//           path="/admin/book/:bookId"
//           element={requireAdmin(
//             <AdminBookDetails />
//           )}
//         />

//         {/* Admin Coupons */}

//         <Route
//           path="/admin/coupon/dashboard"
//           element={requireAdmin(
//             <AdminCouponDashboard />
//           )}
//         />

//         <Route
//           path="/admin/coupon/:id"
//           element={requireAdmin(
//             <CouponDetails />
//           )}
//         />

//         {/* Admin Blogs */}

//         <Route
//           path="/admin/add-blog"
//           element={requireUser(
//             <AddBlogPage />
//           )}
//         />

//         <Route
//           path="/blog-manage"
//           element={requireUser(
//             <AdminBlogManagementPage />
//           )}
//         />

//         {/* Admin Reviews */}

//         <Route
//           path="/admin/generate-review-link"
//           element={requireUser(
//             <GenerateReviewLinkPage />
//           )}
//         />

//         <Route
//           path="/admin/manage-reviews"
//           element={requireUser(
//             <ManageReviewsPage />
//           )}
//         />

//         {/* Admin Portfolio */}

//         <Route
//           path="/admin/add-portfolio"
//           element={requireUser(
//             <AddPortfolioPage />
//           )}
//         />

//         <Route
//           path="/portfolio-manage"
//           element={requireUser(
//             <ManagePortfolio />
//           )}
//         />

//         {/* Admin Contact */}

//         <Route
//           path="/contact-query"
//           element={requireUser(
//             <ContactList />
//           )}
//         />

//         <Route
//           path="/contact-details/:id"
//           element={requireUser(
//             <ContactDetail />
//           )}
//         />

//         {/* Admin Users */}

//         <Route
//           path="/admin/users"
//           element={requireAdmin(
//             <UserManagement />
//           )}
//         />

//         <Route
//           path="/employee/:email"
//           element={requireAdmin(
//             <EmployeeDetails />
//           )}
//         />

//         {/* Admin Booking */}

//         <Route
//           path="/admin/booking"
//           element={requireAdmin(
//             <AdminBookingsPage />
//           )}
//         />

//         <Route
//           path="/admin/slots"
//           element={requireAdmin(
//             <AdminSlotsPage />
//           )}
//         />

//         {/* Admin Affiliate */}

//         <Route
//           path="/admin/affiliate-manage"
//           element={requireUser(
//             <AffiliateList />
//           )}
//         />

//         {/* Clients */}

//         <Route
//           path="/clients"
//           element={requireAdmin(
//             <Clients />
//           )}
//         />

//         <Route
//           path="/clients/:clientId/services"
//           element={requireAdmin(
//             <ClientServices />
//           )}
//         />

//         <Route
//           path="/clients/:clientId/services/:serviceId"
//           element={requireAdmin(
//             <ServiceDetails />
//           )}
//         />

//         <Route
//           path="/interest"
//           element={requireAdmin(
//             <InterestDashboard />
//           )}
//         />

//         {/* 404 */}

//         <Route
//           path="*"
//           element={
//             <NotFoundPage />
//           }
//         />
//       </Routes>

//       <Footer />
//     </div>
//   );
// }

// export default App;

import "./App.css";

import {
  lazy,
  Suspense,
  useEffect,
} from "react";

import {
  Route,
  Routes,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import toast, {
  Toaster,
} from "react-hot-toast";

import {
  Analytics,
} from "@vercel/analytics/react";

import {
  getTokenExpiryFromLocalStorage,
  logout,
} from "./Redux/authSlice.js";

import Navbar from "./component/Navbar";
import Footer from "./component/Footer.jsx";

/*
 * ============================================================
 * ROUTE-LEVEL CODE SPLITTING
 * ============================================================
 *
 * Only Navbar/Footer + the page required for the current route
 * are loaded initially. Heavy book/admin/resource pages are
 * downloaded only when the user visits them.
 */

// Public / common pages
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

const AffiliateMarketing = lazy(() =>
  import("./component/AffiliateMarketing")
);

const CareerPage = lazy(() =>
  import("./component/CareerPage.jsx")
);

const UserProfile = lazy(() =>
  import("./component/UserProfile.jsx")
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

// Learn
const LearnHome = lazy(() =>
  import("./component/LearnHome.jsx")
);

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

const BookReview = lazy(() =>
  import("./component/BookReview")
);

// Books
const BookCallPage = lazy(() =>
  import("./component/BookCallPage")
);

const Books = lazy(() =>
  import("./Ebooks/Books.jsx")
);

const SystemDesignHLD = lazy(() =>
  import("./component/SystemDesignHLD.jsx")
);

const SystemDesignLLD = lazy(() =>
  import("./component/SystemDesignLLD.jsx")
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

// HLD resources
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

// Payment
const PaymentFailed = lazy(() =>
  import("./payment/paymentFailed.jsx")
);

const PaymentSuccess = lazy(() =>
  import("./payment/paymentSuccess.jsx")
);

// Admin
const AdminBlogManagementPage = lazy(() =>
  import("./Admin/AdminBlogList")
);

const AdminBookingsPage = lazy(() =>
  import("./Admin/AdminBookingsPage")
);

const AdminSlotsPage = lazy(() =>
  import("./Admin/AdminSlotsPage")
);

const AddBlogPage = lazy(() =>
  import("./Admin/AddBlogPage")
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

const AdminInterviewDashboard = lazy(() =>
  import("./Admin/AdminInterviewDashboard.jsx")
);

const AdminInterviewEdit = lazy(() =>
  import("./Admin/AdminInterviewEdit.jsx")
);

const AdminBookReviews = lazy(() =>
  import("./Admin/AdminBookReviews.jsx")
);

/*
 * Your service routes are currently commented out in the
 * existing App.jsx, so their eager imports were removed.
 *
 * If you enable those routes later, define them with lazy():
 *
 * const ServicesPage = lazy(() => import("./component/ServicesPage"));
 * const GenAIServicesPage = lazy(() => import("./Services/GenAIServicesPage.jsx"));
 * etc.
 */

/*
 * Small loading UI used only while a lazy route chunk downloads.
 */
const RouteLoader = () => {
  return (
    <div
      className="
        flex
        min-h-[55vh]
        w-full
        items-center
        justify-center
        px-4
      "
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="
            h-8
            w-8
            animate-spin
            rounded-full
            border-[3px]
            border-slate-200
            border-t-blue-600
          "
        />

        <p className="text-sm font-semibold text-slate-500">
          Loading...
        </p>
      </div>
    </div>
  );
};

function App() {
  const dispatch =
    useDispatch();

  const user =
    useSelector(
      (state) =>
        state.auth.user
    );

  const isAdmin =
    user?.role === "admin";

  const isEmployee =
    user?.role ===
    "Employee";

  const isUser =
    isAdmin ||
    isEmployee;

  /*
   * ============================================================
   * TOKEN EXPIRY
   * ============================================================
   *
   * Previously this ran every 5 seconds forever.
   * Checking once per minute + on focus/visibility is enough and
   * reduces unnecessary work, especially on mobile.
   */
  useEffect(() => {
    let hasLoggedOut = false;

    const checkTokenExpiry =
      () => {
        const expiry =
          getTokenExpiryFromLocalStorage();

        if (
          !hasLoggedOut &&
          expiry &&
          Date.now() > expiry
        ) {
          hasLoggedOut = true;

          dispatch(
            logout()
          );

          toast.error(
            "Session expired. You have been logged out."
          );
        }
      };

    checkTokenExpiry();

    const intervalId =
      window.setInterval(
        checkTokenExpiry,
        60_000
      );

    const handleFocus =
      () => {
        checkTokenExpiry();
      };

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          checkTokenExpiry();
        }
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.clearInterval(
        intervalId
      );

      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [dispatch]);

  const requireUser = (
    element
  ) =>
    isUser
      ? element
      : <NotFoundPage />;

  const requireAdmin = (
    element
  ) =>
    isAdmin
      ? element
      : <NotFoundPage />;

  return (
    <div
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        font-inter
      "
    >
      <Toaster />

      <Analytics />

      <Navbar />

      <Suspense
        fallback={
          <RouteLoader />
        }
      >
        <Routes>
          {/* ============================================================ */}
          {/* NORMAL TARGET TREK */}
          {/* ============================================================ */}

          <Route
            path="/"
            element={
              <LearnHome />
            }
          />

          <Route
            path="/about"
            element={
              <AboutPage />
            }
          />

          <Route
            path="/contact"
            element={
              <ContactPage />
            }
          />

          <Route
            path="/portfolio"
            element={
              <PortfolioPage />
            }
          />

          <Route
            path="/portfolio/:slug"
            element={
              <PortfolioDetailPage />
            }
          />

          {/* <Route
            path="/affiliate-marketing"
            element={
              <AffiliateMarketing />
            }
          /> */}

          <Route
            path="/carrers"
            element={
              <CareerPage />
            }
          />

          <Route
            path="/profile"
            element={
              <UserProfile />
            }
          />

          <Route
            path="/submit-review/:token"
            element={
              <SubmitReviewPage />
            }
          />

          {/* Legal */}

          <Route
            path="/privacy-policy"
            element={
              <PrivacyPolicy />
            }
          />

          <Route
            path="/terms-of-service"
            element={
              <TermsOfService />
            }
          />

          <Route
            path="/refund-policy"
            element={
              <RefundPolicy />
            }
          />

          {/*
            ============================================================
            SERVICES
            ============================================================

            These were commented in your original App.jsx.
            Keep them commented unless you reactivate the main website.

            Example:

            <Route
              path="/services"
              element={<ServicesPage />}
            />
          */}

          {/* ============================================================ */}
          {/* TARGET TREK LEARN */}
          {/* ============================================================ */}

          <Route
            path="/learn"
            element={
              <LearnHome />
            }
          />

          {/* Blogs */}

          <Route
            path="/blogs"
            element={
              <BlogPage />
            }
          />

          <Route
            path="/review/:token"
            element={
              <BookReview />
            }
          />

          <Route
            path="/blog/:slug"
            element={
              <BlogPostDetail />
            }
          />

          {/* Interviews */}

          <Route
            path="/interviews"
            element={
              <InterviewFeed />
            }
          />

          <Route
            path="/interview/:slug"
            element={
              <InterviewDetailPage />
            }
          />

          <Route
            path="/interview/create"
            element={
              <AddInterviewExperience />
            }
          />

          {/* Resources */}

          <Route
            path="/resources"
            element={
              <Resources />
            }
          />

          <Route
            path="/resources/hld"
            element={
              <HLDResources />
            }
          />

          <Route
            path="/resources/hld/cache"
            element={
              <HLDCacheResource />
            }
          />

          <Route
            path="/resources/hld/load-balancing"
            element={
              <HLDLoadBalancingResource />
            }
          />

          <Route
            path="/resources/hld/database"
            element={
              <HLDDatabaseResource />
            }
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
            element={
              <SQLResource />
            }
          />

          <Route
            path="/resources/apis"
            element={
              <APIResource />
            }
          />

          {/* Books */}

          <Route
            path="/book"
            element={
              <BookCallPage />
            }
          />

          <Route
            path="/books"
            element={
              <Books />
            }
          />

          <Route
            path="/book/system-design/hld"
            element={
              <SystemDesignHLD />
            }
          />

          <Route
            path="/book/system-design/lld"
            element={
              <SystemDesignLLD />
            }
          />

          <Route
            path="/book/genai/google-adk"
            element={
              <GenAiGoogleAdk />
            }
          />

          <Route
            path="/book/genai/mcp"
            element={
              <GenaiMCP />
            }
          />

          <Route
            path="/book/genai/rag"
            element={
              <GenaiRAG />
            }
          />

          {/* Payment */}

          <Route
            path="/payment/success"
            element={
              <PaymentSuccess />
            }
          />

          <Route
            path="/payment/failed"
            element={
              <PaymentFailed />
            }
          />

          {/* ============================================================ */}
          {/* ADMIN / INTERNAL ROUTES */}
          {/* ============================================================ */}

          {/* Admin Auth */}

          <Route
            path="/admin/login"
            element={
              !isUser
                ? <LoginPage />
                : <HomePage />
            }
          />

          <Route
            path="/admin/signup"
            element={
              isAdmin
                ? <AdminSignup />
                : <HomePage />
            }
          />

          {/* Main Admin */}

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

          {/* Admin Interviews */}

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

          {/* Admin Books */}

          <Route
            path="/admin/books"
            element={requireAdmin(
              <AdminBooks />
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

          {/* Admin Coupons */}

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

          {/* Admin Blogs */}

          <Route
            path="/admin/add-blog"
            element={requireUser(
              <AddBlogPage />
            )}
          />

          <Route
            path="/blog-manage"
            element={requireUser(
              <AdminBlogManagementPage />
            )}
          />

          {/* Admin Reviews */}

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

          {/* Admin Portfolio */}

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

          {/* Admin Contact */}

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

          {/* Admin Users */}

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

          {/* Admin Booking */}

          <Route
            path="/admin/booking"
            element={requireAdmin(
              <AdminBookingsPage />
            )}
          />

          <Route
            path="/admin/slots"
            element={requireAdmin(
              <AdminSlotsPage />
            )}
          />

          {/* Admin Affiliate */}

          <Route
            path="/admin/affiliate-manage"
            element={requireUser(
              <AffiliateList />
            )}
          />

          {/* Clients */}

          <Route
            path="/clients"
            element={requireAdmin(
              <Clients />
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

          <Route
            path="/interest"
            element={requireAdmin(
              <InterestDashboard />
            )}
          />

          {/* 404 */}

          <Route
            path="*"
            element={
              <NotFoundPage />
            }
          />
        </Routes>
      </Suspense>

      <Footer />
    </div>
  );
}

export default App;
