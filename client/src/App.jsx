import "./App.css";
import {
  Route,
  Routes,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

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
  logout,
  getTokenExpiryFromLocalStorage,
} from "./Redux/authSlice.js";

import Navbar from "./component/Navbar";
import Footer from "./component/Footer.jsx";
import FloatingContact from "./component/FloatingContact.jsx";

import HomePage from "./component/HomePage";
import BookCallPage from "./component/BookCallPage";
import ServicesPage from "./component/ServicesPage";
import ContactPage from "./component/ContactPage";
import BlogPage from "./component/BlogPage";
import PortfolioPage from "./component/PortfolioPage";
import AboutPage from "./component/AboutPage";
import SubmitReviewPage from "./component/SumbitReviewPage";
import BlogPostDetail from "./component/BlogPostDetail";
import AffiliateMarketing from "./component/AffiliateMarketing";
import NotFoundPage from "./component/NotFoundPage";
import PortfolioDetailPage from "./component/PortfolioDetailPage";
import UserProfile from "./component/UserProfile.jsx";
import CareerPage from "./component/CareerPage.jsx";
import PrivacyPolicy from "./component/PrivacyPolicy.jsx";
import TermsOfService from "./component/TermsOfService.jsx";

import GenAIServicesPage from "./Services/GenAIServicesPage.jsx";
import WebDevelopmentPage from "./Services/WebDevelopmentPage.jsx";
import PPCAdvertisingPage from "./Services/PPCAdvertisingPage.jsx";
import SocialMediaMarketingPage from "./Services/SocialMediaMarketingPage.jsx";
import ContentMarketingPage from "./Services/ContentMarketingPage.jsx";
import AffiliateMarketingPage from "./Services/AffiliateMarketingPage.jsx";


import Books from "./Ebooks/Books.jsx";
import SystemDesignHLD from "./component/SystemDesignHLD.jsx";
import SystemDesignLLD from "./component/SystemDesignLLD.jsx";
import GenAiGoogleAdk from "./component/GenAiGoogleAdk.jsx";

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

import AdminBooks from "./Admin/AdminBooks.jsx";
import AddBook from "./Admin/AddBook.jsx";
import AdminBookDetails from "./Admin/AdminBookDetails.jsx";

function App() {
  const user = useSelector(
    (state) => state.auth.user
  );

  const dispatch = useDispatch();

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [isUser, setIsUser] =
    useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const expiry =
        getTokenExpiryFromLocalStorage();

      if (
        expiry &&
        Date.now() > expiry
      ) {
        dispatch(logout());

        toast.error(
          "Session expired. You have been logged out."
        );

        clearInterval(intervalId);
      }
    }, 5000);

    return () =>
      clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsUser(false);
      return;
    }

    const adminStatus =
      user.role === "admin";

    const employeeStatus =
      user.role === "Employee";

    setIsAdmin(adminStatus);

    setIsUser(
      adminStatus ||
        employeeStatus
    );
  }, [user]);

  return (
    <div className="w-[90%] mx-auto max-h-max font-inter">
      <Toaster />

      <Analytics />

      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/services"
          element={<ServicesPage />}
        />

        <Route
          path="/contact"
          element={<ContactPage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route
          path="/portfolio"
          element={<PortfolioPage />}
        />

        <Route
          path="/portfolio/:slug"
          element={
            <PortfolioDetailPage />
          }
        />

        <Route
          path="/blogs"
          element={<BlogPage />}
        />

        <Route
          path="/blog/:slug"
          element={<BlogPostDetail />}
        />

        <Route
          path="/affiliate-marketing"
          element={
            <AffiliateMarketing />
          }
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/terms-of-service"
          element={
            <TermsOfService />
          }
        />

        <Route
          path="/carrers"
          element={<CareerPage />}
        />

        <Route
          path="/profile"
          element={<UserProfile />}
        />

        <Route
          path="/submit-review/:token"
          element={
            <SubmitReviewPage />
          }
        />

        {/* SERVICES */}

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
        />

        {/* ============================== */}
        {/* BOOK ROUTES */}
        {/* ============================== */}

        <Route
          path="/book"
          element={<BookCallPage />}
        />

        <Route
          path="/books"
          element={<Books />}
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


        {/* ============================== */}
        {/* PAYMENT ROUTES */}
        {/* ============================== */}

        <Route
          path="/payment/success"
          element={<PaymentSuccess />}
        />

        <Route
          path="/payment/failed"
          element={<PaymentFailed />}
        />


        {/* ============================== */}
        {/* ADMIN AUTH */}
        {/* ============================== */}

        <Route
          path="/admin/login"
          element={
            !isUser ? (
              <LoginPage />
            ) : (
              <HomePage />
            )
          }
        />

        <Route
          path="/admin/signup"
          element={
            isAdmin ? (
              <AdminSignup />
            ) : (
              <HomePage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN DASHBOARD */}
        {/* ============================== */}

        <Route
          path="/dashboard"
          element={
            isUser ? (
              <AdminDashboard />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            isAdmin ? (
              <SalesDashboard />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN BOOK ROUTES */}
        {/* ============================== */}

        <Route
          path="/admin/books"
          element={
            isAdmin ? (
              <AdminBooks />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/admin/book/create"
          element={
            isAdmin ? (
              <AddBook />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/admin/book/:bookId"
          element={
            isAdmin ? (
              <AdminBookDetails />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN BLOG ROUTES */}
        {/* ============================== */}

        <Route
          path="/admin/add-blog"
          element={
            isUser ? (
              <AddBlogPage />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/blog-manage"
          element={
            isUser ? (
              <AdminBlogManagementPage />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN REVIEW ROUTES */}
        {/* ============================== */}

        <Route
          path="/admin/generate-review-link"
          element={
            isUser ? (
              <GenerateReviewLinkPage />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/admin/manage-reviews"
          element={
            isUser ? (
              <ManageReviewsPage />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN PORTFOLIO ROUTES */}
        {/* ============================== */}

        <Route
          path="/admin/add-portfolio"
          element={
            isUser ? (
              <AddPortfolioPage />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/portfolio-manage"
          element={
            isUser ? (
              <ManagePortfolio />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN CONTACT ROUTES */}
        {/* ============================== */}

        <Route
          path="/contact-query"
          element={
            isUser ? (
              <ContactList />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/contact-details/:id"
          element={
            isUser ? (
              <ContactDetail />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN USERS */}
        {/* ============================== */}

        <Route
          path="/admin/users"
          element={
            isAdmin ? (
              <UserManagement />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/employee/:email"
          element={
            isAdmin ? (
              <EmployeeDetails />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN BOOKINGS */}
        {/* ============================== */}

        <Route
          path="/admin/booking"
          element={
            isAdmin ? (
              <AdminBookingsPage />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/admin/slots"
          element={
            isAdmin ? (
              <AdminSlotsPage />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* ADMIN AFFILIATE */}
        {/* ============================== */}

        <Route
          path="/admin/affiliate-manage"
          element={
            isUser ? (
              <AffiliateList />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* ============================== */}
        {/* CLIENT ROUTES */}
        {/* ============================== */}

        <Route
          path="/clients"
          element={
            isAdmin ? (
              <Clients />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/clients/:clientId/services"
          element={
            isAdmin ? (
              <ClientServices />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/clients/:clientId/services/:serviceId"
          element={
            isAdmin ? (
              <ServiceDetails />
            ) : (
              <NotFoundPage />
            )
          }
        />

        <Route
          path="/interest"
          element={
            isAdmin ? (
              <InterestDashboard />
            ) : (
              <NotFoundPage />
            )
          }
        />

        {/* 404 */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>

      <FloatingContact />

      <Footer />
    </div>
  );
}

export default App;