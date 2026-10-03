import "./App.css";

import { useEffect } from "react";
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

import HomePage from "./component/HomePage";
import AboutPage from "./component/AboutPage";
import ServicesPage from "./component/ServicesPage";
import ContactPage from "./component/ContactPage";
import PortfolioPage from "./component/PortfolioPage";
import PortfolioDetailPage from "./component/PortfolioDetailPage";
import AffiliateMarketing from "./component/AffiliateMarketing";
import CareerPage from "./component/CareerPage.jsx";
import UserProfile from "./component/UserProfile.jsx";
import SubmitReviewPage from "./component/SumbitReviewPage";
import PrivacyPolicy from "./component/PrivacyPolicy.jsx";
import TermsOfService from "./component/TermsOfService.jsx";
import RefundPolicy from "./component/RefundPolicy.jsx";
import NotFoundPage from "./component/NotFoundPage";

import GenAIServicesPage from "./Services/GenAIServicesPage.jsx";
import WebDevelopmentPage from "./Services/WebDevelopmentPage.jsx";
import PPCAdvertisingPage from "./Services/PPCAdvertisingPage.jsx";
import SocialMediaMarketingPage from "./Services/SocialMediaMarketingPage.jsx";
import ContentMarketingPage from "./Services/ContentMarketingPage.jsx";
import AffiliateMarketingPage from "./Services/AffiliateMarketingPage.jsx";

import LearnHome from "./component/LearnHome.jsx";
import BlogPage from "./component/BlogPage";
import BlogPostDetail from "./component/BlogPostDetail";
import InterviewFeed from "./component/InterviewFeed.jsx";
import AddInterviewExperience from "./component/AddInterviewExperience.jsx";
import InterviewDetailPage from "./component/InterviewDetailPage.jsx";
import Resources from "./component/Resources.jsx";

import BookCallPage from "./component/BookCallPage";
import Books from "./Ebooks/Books.jsx";
import SystemDesignHLD from "./component/SystemDesignHLD.jsx";
import SystemDesignLLD from "./component/SystemDesignLLD.jsx";
import GenAiGoogleAdk from "./component/GenAiGoogleAdk.jsx";
import GenaiMCP from "./component/GenaiMCP.jsx";
import GenaiRAG from "./component/GenaiRAG.jsx";

import HLDResources from "./hld/HLDResources.jsx";
import HLDCacheResource from "./hld/HLDCacheResource.jsx";
import HLDLoadBalancingResource from "./hld/HLDLoadBalancingResource.jsx";
import HLDDatabaseResource from "./hld/HLDDatabaseResource.jsx";
import HLDMessageQueueResource from "./hld/HLDMessageQueueResource.jsx";
import HLDRateLimitingResource from "./hld/HLDRateLimitingResource.jsx";
import HLDApiGatewayResource from "./hld/HLDApiGatewayResource.jsx";

import PaymentFailed from "./payment/paymentFailed.jsx";
import PaymentSuccess from "./payment/paymentSuccess.jsx";

import AdminBlogManagementPage from "./Admin/AdminBlogList";
import AdminBookingsPage from "./Admin/AdminBookingsPage";
import AdminSlotsPage from "./Admin/AdminSlotsPage";
import AddBlogPage from "./Admin/AddBlogPage";
import LoginPage from "./Admin/LoginPage";
import GenerateReviewLinkPage from "./Admin/GenerateReview";
import ManageReviewsPage from "./Admin/ManageReviewPage";
import ContactList from "./Admin/ContactList";
import ContactDetail from "./Admin/ContactDetails";
import AddPortfolioPage from "./Admin/AddPortfolioPage";
import ManagePortfolio from "./Admin/ManagePortFolio";
import AffiliateList from "./Admin/AffiliateList.jsx";
import InterestDashboard from "./Admin/InterestDashboard.jsx";
import AdminSignup from "./Admin/AdminSignup.jsx";
import ClientServices from "./Admin/ClientServices.jsx";
import ServiceDetails from "./Admin/ServiceDetails.jsx";
import Clients from "./Admin/Clients.jsx";
import AdminDashboard from "./Admin/AdminDashBoard.jsx";
import UserManagement from "./Admin/UserManagement.jsx";
import EmployeeDetails from "./Admin/EmployeeDetails.jsx";
import SalesDashboard from "./Admin/SalesDashboard.jsx";
import BookSalesAnalytics from "./Admin/BookSalesAnalytics.jsx";
import AdminBooks from "./Admin/AdminBooks.jsx";
import AddBook from "./Admin/AddBook.jsx";
import AdminBookDetails from "./Admin/AdminBookDetails.jsx";
import AdminBookPayments from "./Admin/AdminBookPayments.jsx";
import AdminCouponDashboard from "./Admin/AdminCouponDashboard.jsx";
import CouponDetails from "./Admin/couponDetails.jsx";
import EmailCampaignDashboard from "./Admin/EmailCampaignDashboard.jsx";
import AdminInterviewDashboard from "./Admin/AdminInterviewDashboard.jsx";
import AdminInterviewEdit from "./Admin/AdminInterviewEdit.jsx";
import SQLResource from "./sql/SQLResource.jsx";
import APIResource from "./api/APIResource.jsx";
import BookReview from "./component/BookReview";

import AdminBookReviews from "./Admin/AdminBookReviews.jsx";

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
    user?.role === "Employee";

  const isUser =
    isAdmin ||
    isEmployee;

  useEffect(() => {
    const checkTokenExpiry =
      () => {
        const expiry =
          getTokenExpiryFromLocalStorage();

        if (
          expiry &&
          Date.now() >
            expiry
        ) {
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
      setInterval(
        checkTokenExpiry,
        5000
      );

    return () =>
      clearInterval(
        intervalId
      );
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

        <Route
          path="/affiliate-marketing"
          element={
            <AffiliateMarketing />
          }
        />

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

        {/* Services */}
{/* 
        <Route
          path="/services"
          element={
            <ServicesPage />
          }
        />

        <Route
          path="/services/genai-solutions"
          element={
            <GenAIServicesPage />
          }
        />

        <Route
          path="/services/web-development"
          element={
            <WebDevelopmentPage />
          }
        />

        <Route
          path="/services/ppc-advertising"
          element={
            <PPCAdvertisingPage />
          }
        />

        <Route
          path="/services/social-media-marketing"
          element={
            <SocialMediaMarketingPage />
          }
        />

        <Route
          path="/services/content-marketing"
          element={
            <ContentMarketingPage />
          }
        />

        <Route
          path="/services/affiliate-marketing"
          element={
            <AffiliateMarketingPage />
          }
        /> */}

        {/* ============================================================ */}
        {/* TARGET TREK LEARN */}
        {/* ============================================================ */}

        <Route
          path="/learn"
          element={
            <LearnHome />
          }
        />

        {/* Blogs - Learn only */}

        <Route
          path="/blogs"
          element={
            <BlogPage />
          }
        />
        <Route
        path="/review/:token"
        element={<BookReview />}
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

        {/* Payment routes belong to Learn purchases */}

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

      <Footer />
    </div>
  );
}

export default App;