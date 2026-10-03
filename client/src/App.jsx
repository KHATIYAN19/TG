// // import "./App.css";
// // import {
// //   Route,
// //   Routes,
// // } from "react-router-dom";

// // import {
// //   useEffect,
// //   useState,
// // } from "react";

// // import {
// //   useDispatch,
// //   useSelector,
// // } from "react-redux";

// // import toast, {
// //   Toaster,
// // } from "react-hot-toast";

// // import {
// //   Analytics,
// // } from "@vercel/analytics/react";

// // import {
// //   logout,
// //   getTokenExpiryFromLocalStorage,
// // } from "./Redux/authSlice.js";

// // import Navbar from "./component/Navbar";
// // import Footer from "./component/Footer.jsx";

// // import HomePage from "./component/HomePage";
// // import BookCallPage from "./component/BookCallPage";
// // import ServicesPage from "./component/ServicesPage";
// // import ContactPage from "./component/ContactPage";
// // import BlogPage from "./component/BlogPage";
// // import PortfolioPage from "./component/PortfolioPage";
// // import AboutPage from "./component/AboutPage";
// // import SubmitReviewPage from "./component/SumbitReviewPage";
// // import BlogPostDetail from "./component/BlogPostDetail";
// // import AffiliateMarketing from "./component/AffiliateMarketing";
// // import NotFoundPage from "./component/NotFoundPage";
// // import PortfolioDetailPage from "./component/PortfolioDetailPage";
// // import UserProfile from "./component/UserProfile.jsx";
// // import CareerPage from "./component/CareerPage.jsx";
// // import PrivacyPolicy from "./component/PrivacyPolicy.jsx";
// // import TermsOfService from "./component/TermsOfService.jsx";
// // import RefundPolicy from "./component/RefundPolicy.jsx";

// // import GenAIServicesPage from "./Services/GenAIServicesPage.jsx";
// // import WebDevelopmentPage from "./Services/WebDevelopmentPage.jsx";
// // import PPCAdvertisingPage from "./Services/PPCAdvertisingPage.jsx";
// // import SocialMediaMarketingPage from "./Services/SocialMediaMarketingPage.jsx";
// // import ContentMarketingPage from "./Services/ContentMarketingPage.jsx";
// // import AffiliateMarketingPage from "./Services/AffiliateMarketingPage.jsx";


// // import Books from "./Ebooks/Books.jsx";
// // import SystemDesignHLD from "./component/SystemDesignHLD.jsx";
// // import SystemDesignLLD from "./component/SystemDesignLLD.jsx";
// // import GenAiGoogleAdk from "./component/GenAiGoogleAdk.jsx";
// // import GenaiMCP from "./component/GenaiMCP.jsx"

// // import PaymentFailed from "./payment/paymentFailed.jsx";
// // import PaymentSuccess from "./payment/paymentSuccess.jsx";

// // import AdminBlogManagementPage from "./Admin/AdminBlogList";
// // import AdminBookingsPage from "./Admin/AdminBookingsPage";
// // import AdminSlotsPage from "./Admin/AdminSlotsPage";
// // import AddBlogPage from "./Admin/AddBlogPage";
// // import LoginPage from "./Admin/LoginPage";
// // import GenerateReviewLinkPage from "./Admin/GenerateReview";
// // import ManageReviewsPage from "./Admin/ManageReviewPage";
// // import ContactList from "./Admin/ContactList";
// // import ContactDetail from "./Admin/ContactDetails";
// // import AddPortfolioPage from "./Admin/AddPortfolioPage";
// // import ManagePortfolio from "./Admin/ManagePortFolio";
// // import AffiliateList from "./Admin/AffiliateList.jsx";
// // import InterestDashboard from "./Admin/InterestDashboard.jsx";
// // import AdminSignup from "./Admin/AdminSignup.jsx";
// // import ClientServices from "./Admin/ClientServices.jsx";
// // import ServiceDetails from "./Admin/ServiceDetails.jsx";
// // import Clients from "./Admin/Clients.jsx";
// // import AdminDashboard from "./Admin/AdminDashBoard.jsx";
// // import UserManagement from "./Admin/UserManagement.jsx";
// // import EmployeeDetails from "./Admin/EmployeeDetails.jsx";
// // import SalesDashboard from "./Admin/SalesDashboard.jsx";

// // import BookSalesAnalytics from "./Admin/BookSalesAnalytics.jsx";
// // import AdminBooks from "./Admin/AdminBooks.jsx";
// // import AddBook from "./Admin/AddBook.jsx";
// // import AdminBookDetails from "./Admin/AdminBookDetails.jsx";
// // import AdminBookPayments from "./Admin/AdminBookPayments.jsx";
// // import GenaiRAG from "./component/GenaiRAG.jsx";


// // import AdminCouponDashboard from "./Admin/AdminCouponDashboard.jsx"
// // import CouponDetails from "./Admin/couponDetails.jsx";
// // import EmailCampaignDashboard from "./Admin/EmailCampaignDashboard.jsx";



// // import InterviewFeed from "./component/InterviewFeed.jsx"

// // import AddInterviewExperience from "./component/AddInterviewExperience.jsx";
// // import AdminInterviewDashboard from "./Admin/AdminInterviewDashboard.jsx";
// // import AdminInterviewEdit from "./Admin/AdminInterviewEdit.jsx";
// // import InterviewDetailPage from "./component/InterviewDetailPage.jsx";


// // import HLDCacheResource from "./hld/HLDCacheResource.jsx";
// // import HLDLoadBalancingResource from "./hld/HLDLoadBalancingResource.jsx"
// // import HLDDatabaseResource from "./hld/HLDDatabaseResource.jsx"
// // import HLDMessageQueueResource from "./hld/HLDMessageQueueResource.jsx"
// // import HLDRateLimitingResource from "./hld/HLDRateLimitingResource.jsx"
// // import HLDApiGatewayResource from "./hld/HLDApiGatewayResource.jsx"
// // import LearnHome from "./component/LearnHome.jsx"

// // function App() {
// //   const user = useSelector(
// //     (state) => state.auth.user
// //   );

// //   const dispatch = useDispatch();

// //   const [isAdmin, setIsAdmin] =
// //     useState(false);

// //   const [isUser, setIsUser] =
// //     useState(false);

// //   useEffect(() => {
// //     const intervalId = setInterval(() => {
// //       const expiry =
// //         getTokenExpiryFromLocalStorage();

// //       if (
// //         expiry &&
// //         Date.now() > expiry
// //       ) {
// //         dispatch(logout());

// //         toast.error(
// //           "Session expired. You have been logged out."
// //         );

// //         clearInterval(intervalId);
// //       }
// //     }, 5000);

// //     return () =>
// //       clearInterval(intervalId);
// //   }, [dispatch]);

// //   useEffect(() => {
// //     if (!user) {
// //       setIsAdmin(false);
// //       setIsUser(false);
// //       return;
// //     }

// //     const adminStatus =
// //       user.role === "admin";

// //     const employeeStatus =
// //       user.role === "Employee";

// //     setIsAdmin(adminStatus);

// //     setIsUser(
// //       adminStatus ||
// //         employeeStatus
// //     );
// //   }, [user]);

// //   return (
// //     <div className="w-[90%] mx-auto max-h-max font-inter">
// //       <Toaster />

// //       <Analytics />

// //       <Navbar />

// //       <Routes>
// //         {/* PUBLIC ROUTES */}

// //         <Route
// //           path="/"
// //           element={<HomePage />}
// //         />

// //         <Route
// //           path="/services"
// //           element={<ServicesPage />}
// //         />

// //         <Route
// //           path="/contact"
// //           element={<ContactPage />}
// //         />

// //         <Route
// //           path="/about"
// //           element={<AboutPage />}
// //         />

// //         <Route
// //           path="/portfolio"
// //           element={<PortfolioPage />}
// //         />

// //         <Route
// //           path="/portfolio/:slug"
// //           element={
// //             <PortfolioDetailPage />
// //           }
// //         />

// //         <Route
// //           path="/blogs"
// //           element={<BlogPage />}
// //         />

// //         <Route
// //           path="/blog/:slug"
// //           element={<BlogPostDetail />}
// //         />

// //         <Route
// //           path="/affiliate-marketing"
// //           element={
// //             <AffiliateMarketing />
// //           }
// //         />

// //         <Route
// //           path="/privacy-policy"
// //           element={<PrivacyPolicy />}
// //         />

// //         <Route
// //           path="/terms-of-service"
// //           element={
// //             <TermsOfService />
// //           }
// //         />

// //         <Route
// //           path="/refund-policy"
// //           element={
// //             <RefundPolicy />
// //           }
// //         />

// //         <Route
// //           path="/carrers"
// //           element={<CareerPage />}
// //         />

// //         <Route
// //           path="/profile"
// //           element={<UserProfile />}
// //         />

// //         <Route
// //           path="/submit-review/:token"
// //           element={
// //             <SubmitReviewPage />
// //           }
// //         />

// //         {/* SERVICES */}

// //         <Route
// //           path="/services/genai-solutions"
// //           element={
// //             <GenAIServicesPage />
// //           }
// //         />

// //         <Route
// //           path="/interviews"
// //           element={
// //             <InterviewFeed />
// //           }
// //         />
// //         <Route
// //           path="/interview/:slug"
// //           element={
// //             <InterviewDetailPage />
// //           }
// //         />
// //         <Route
// //           path="/services/web-development"
// //           element={
// //             <WebDevelopmentPage />
// //           }
// //         />

// //         <Route
// //           path="/services/ppc-advertising"
// //           element={
// //             <PPCAdvertisingPage />
// //           }
// //         />
// //         <Route
// //   path="/resources/hld/cache"
// //   element={<HLDCacheResource />}
// // />
// //         <Route
// //   path="/resources/hld/load-balancing"
// //   element={<HLDLoadBalancingResource />}
// // />
// //         <Route
// //   path="/resources/hld/database"
// //   element={<HLDDatabaseResource />}
// // />

// //         <Route
// //   path="/resources/hld/message-queue"
// //   element={<HLDMessageQueueResource />}
// // />

// //         <Route
// //   path="/resources/hld/rate-limiting"
// //   element={<HLDRateLimitingResource/>}
// // />

// //         <Route
// //   path="/resources/hld/api-gateway"
// //   element={<HLDApiGatewayResource/>}
// // />
// //         <Route
// //   path="/learn"
// //   element={<LearnHome/>}
// // />


// //         <Route
// //           path="/services/social-media-marketing"
// //           element={
// //             <SocialMediaMarketingPage />
// //           }
// //         />

// //         <Route
// //           path="/services/content-marketing"
// //           element={
// //             <ContentMarketingPage />
// //           }
// //         />

// //         <Route
// //           path="/services/affiliate-marketing"
// //           element={
// //             <AffiliateMarketingPage />
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* BOOK ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/book"
// //           element={<BookCallPage />}
// //         />

// //         <Route
// //           path="/books"
// //           element={<Books />}
// //         />

// //         <Route
// //           path="/book/system-design/hld"
// //           element={
// //             <SystemDesignHLD />
// //           }
// //         />

// //         <Route
// //           path="/book/system-design/lld"
// //           element={
// //             <SystemDesignLLD />
// //           }
// //         />

// //         <Route
// //           path="/book/genai/google-adk"
// //           element={
// //             <GenAiGoogleAdk />
// //           }
// //         />

// //         <Route
// //           path="/book/genai/mcp"
// //           element={
// //             <GenaiMCP />
// //           }
// //         />

// //          <Route
// //           path="/book/genai/rag"
// //           element={
// //             <GenaiRAG />
// //           }
// //         />
        
// //         <Route
// //           path="/interview/create"
// //           element={
// //             <AddInterviewExperience />
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* PAYMENT ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/payment/success"
// //           element={<PaymentSuccess />}
// //         />

// //         <Route
// //           path="/payment/failed"
// //           element={<PaymentFailed />}
// //         />


// //         {/* ============================== */}
// //         {/* ADMIN AUTH */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/login"
// //           element={
// //             !isUser ? (
// //               <LoginPage />
// //             ) : (
// //               <HomePage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/admin/signup"
// //           element={
// //             isAdmin ? (
// //               <AdminSignup />
// //             ) : (
// //               <HomePage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN DASHBOARD */}
// //         {/* ============================== */}

// //         <Route
// //           path="/dashboard"
// //           element={
// //             isUser ? (
// //               <AdminDashboard />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />
// //         <Route
// //           path="/campaign"
// //           element={
// //             isUser ? (
// //               <EmailCampaignDashboard />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/admin/interviews"
// //           element={
// //             isUser ? (
// //               <AdminInterviewDashboard />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //       <Route
// //           path="/admin/interviews/:id"
// //           element={
// //             isUser ? (
// //               <AdminInterviewEdit />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />


// //         <Route
// //           path="/admin/dashboard"
// //           element={
// //             isAdmin ? (
// //               <SalesDashboard />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //           <Route
// //           path="/admin/book/analytics"
// //           element={
// //             isAdmin ? (
// //               <BookSalesAnalytics />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //          <Route
// //           path="/admin/coupon/dashboard"
// //           element={
// //             isAdmin ? (
// //               <AdminCouponDashboard />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //          <Route
// //           path="/admin/coupon/:id"
// //           element={
// //             isAdmin ? (
// //               <CouponDetails />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN BOOK ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/books"
// //           element={
// //             isAdmin ? (
// //               <AdminBooks />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/admin/book/create"
// //           element={
// //             isAdmin ? (
// //               <AddBook />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/admin/book/:bookId"
// //           element={
// //             isAdmin ? (
// //               <AdminBookDetails />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //          <Route
// //           path="/admin/book/:bookId/payments"
// //           element={
// //             isAdmin ? (
// //               <AdminBookPayments />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN BLOG ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/add-blog"
// //           element={
// //             isUser ? (
// //               <AddBlogPage />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/blog-manage"
// //           element={
// //             isUser ? (
// //               <AdminBlogManagementPage />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN REVIEW ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/generate-review-link"
// //           element={
// //             isUser ? (
// //               <GenerateReviewLinkPage />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/admin/manage-reviews"
// //           element={
// //             isUser ? (
// //               <ManageReviewsPage />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN PORTFOLIO ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/add-portfolio"
// //           element={
// //             isUser ? (
// //               <AddPortfolioPage />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/portfolio-manage"
// //           element={
// //             isUser ? (
// //               <ManagePortfolio />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN CONTACT ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/contact-query"
// //           element={
// //             isUser ? (
// //               <ContactList />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/contact-details/:id"
// //           element={
// //             isUser ? (
// //               <ContactDetail />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN USERS */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/users"
// //           element={
// //             isAdmin ? (
// //               <UserManagement />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/employee/:email"
// //           element={
// //             isAdmin ? (
// //               <EmployeeDetails />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN BOOKINGS */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/booking"
// //           element={
// //             isAdmin ? (
// //               <AdminBookingsPage />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/admin/slots"
// //           element={
// //             isAdmin ? (
// //               <AdminSlotsPage />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* ADMIN AFFILIATE */}
// //         {/* ============================== */}

// //         <Route
// //           path="/admin/affiliate-manage"
// //           element={
// //             isUser ? (
// //               <AffiliateList />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* ============================== */}
// //         {/* CLIENT ROUTES */}
// //         {/* ============================== */}

// //         <Route
// //           path="/clients"
// //           element={
// //             isAdmin ? (
// //               <Clients />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/clients/:clientId/services"
// //           element={
// //             isAdmin ? (
// //               <ClientServices />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/clients/:clientId/services/:serviceId"
// //           element={
// //             isAdmin ? (
// //               <ServiceDetails />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         <Route
// //           path="/interest"
// //           element={
// //             isAdmin ? (
// //               <InterestDashboard />
// //             ) : (
// //               <NotFoundPage />
// //             )
// //           }
// //         />

// //         {/* 404 */}

// //         <Route
// //           path="*"
// //           element={<NotFoundPage />}
// //         />
// //       </Routes>


// //       <Footer />
// //     </div>
// //   );
// // }

// // export default App;

// import "./App.css";

// import { useEffect } from "react";
// import { Route, Routes } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
// import { Analytics } from "@vercel/analytics/react";

// import {
//   logout,
//   getTokenExpiryFromLocalStorage,
// } from "./Redux/authSlice.js";

// import Navbar from "./component/Navbar";
// import Footer from "./component/Footer.jsx";

// import HomePage from "./component/HomePage";
// import BookCallPage from "./component/BookCallPage";
// import ServicesPage from "./component/ServicesPage";
// import ContactPage from "./component/ContactPage";
// import BlogPage from "./component/BlogPage";
// import PortfolioPage from "./component/PortfolioPage";
// import AboutPage from "./component/AboutPage";
// import SubmitReviewPage from "./component/SumbitReviewPage";
// import BlogPostDetail from "./component/BlogPostDetail";
// import AffiliateMarketing from "./component/AffiliateMarketing";
// import NotFoundPage from "./component/NotFoundPage";
// import PortfolioDetailPage from "./component/PortfolioDetailPage";
// import UserProfile from "./component/UserProfile.jsx";
// import CareerPage from "./component/CareerPage.jsx";
// import PrivacyPolicy from "./component/PrivacyPolicy.jsx";
// import TermsOfService from "./component/TermsOfService.jsx";
// import RefundPolicy from "./component/RefundPolicy.jsx";
// import LearnHome from "./component/LearnHome.jsx";
// import Resources from "./component/Resources.jsx"

// import GenAIServicesPage from "./Services/GenAIServicesPage.jsx";
// import WebDevelopmentPage from "./Services/WebDevelopmentPage.jsx";
// import PPCAdvertisingPage from "./Services/PPCAdvertisingPage.jsx";
// import SocialMediaMarketingPage from "./Services/SocialMediaMarketingPage.jsx";
// import ContentMarketingPage from "./Services/ContentMarketingPage.jsx";
// import AffiliateMarketingPage from "./Services/AffiliateMarketingPage.jsx";

// import Books from "./Ebooks/Books.jsx";
// import SystemDesignHLD from "./component/SystemDesignHLD.jsx";
// import SystemDesignLLD from "./component/SystemDesignLLD.jsx";
// import GenAiGoogleAdk from "./component/GenAiGoogleAdk.jsx";
// import GenaiMCP from "./component/GenaiMCP.jsx";
// import GenaiRAG from "./component/GenaiRAG.jsx";

// import PaymentFailed from "./payment/paymentFailed.jsx";
// import PaymentSuccess from "./payment/paymentSuccess.jsx";

// import InterviewFeed from "./component/InterviewFeed.jsx";
// import AddInterviewExperience from "./component/AddInterviewExperience.jsx";
// import InterviewDetailPage from "./component/InterviewDetailPage.jsx";

// import HLDCacheResource from "./hld/HLDCacheResource.jsx";
// import HLDLoadBalancingResource from "./hld/HLDLoadBalancingResource.jsx";
// import HLDDatabaseResource from "./hld/HLDDatabaseResource.jsx";
// import HLDMessageQueueResource from "./hld/HLDMessageQueueResource.jsx";
// import HLDRateLimitingResource from "./hld/HLDRateLimitingResource.jsx";
// import HLDApiGatewayResource from "./hld/HLDApiGatewayResource.jsx";
// import HLDResources from "./hld/HLDResources.jsx"
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

// function App() {
//   const dispatch = useDispatch();

//   const user = useSelector(
//     (state) => state.auth.user
//   );

//   const isAdmin =
//     user?.role === "admin";

//   const isEmployee =
//     user?.role === "Employee";

//   const isUser =
//     isAdmin || isEmployee;

//   useEffect(() => {
//     const checkTokenExpiry = () => {
//       const expiry =
//         getTokenExpiryFromLocalStorage();

//       if (
//         expiry &&
//         Date.now() > expiry
//       ) {
//         dispatch(logout());

//         toast.error(
//           "Session expired. You have been logged out."
//         );
//       }
//     };

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
//   ) => {
//     return isUser
//       ? element
//       : <NotFoundPage />;
//   };

//   const requireAdmin = (
//     element
//   ) => {
//     return isAdmin
//       ? element
//       : <NotFoundPage />;
//   };

//   return (
//     <div className="w-full min-h-screen overflow-x-hidden font-inter">
//       <Toaster />

//       <Analytics />

//       <Navbar />

//       <Routes>
//         {/* Public */}

//         <Route
//           path="/"
//           element={<HomePage />}
//         />

//         <Route
//           path="/learn"
//           element={<LearnHome />}
//         />

//         <Route
//           path="/about"
//           element={<AboutPage />}
//         />

//         <Route
//           path="/contact"
//           element={<ContactPage />}
//         />

//         <Route
//           path="/portfolio"
//           element={<PortfolioPage />}
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
//           element={<CareerPage />}
//         />

//         <Route
//           path="/profile"
//           element={<UserProfile />}
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
//           element={<PrivacyPolicy />}
//         />

//         <Route
//           path="/terms-of-service"
//           element={
//             <TermsOfService />
//           }
//         />

//         <Route
//           path="/refund-policy"
//           element={<RefundPolicy />}
//         />

//         {/* Services */}

//         <Route
//           path="/services"
//           element={<ServicesPage />}
//         />

//         <Route
//           path="/services/genai-solutions"
//           element={
//             <GenAIServicesPage />
//           }
//         />

//                 <Route
//           path="/resources"
//           element={
//             <Resources />
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
//         />

//         {/* Blogs */}

//         <Route
//           path="/blogs"
//           element={<BlogPage />}
//         />

//         <Route
//           path="/blog/:slug"
//           element={<BlogPostDetail />}
//         />

//         {/* Interviews */}

//         <Route
//           path="/interviews"
//           element={<InterviewFeed />}
//         />

//         <Route
//           path="/interview/:slug"
//           element={
//             <InterviewDetailPage />
//           }
//         />

//         <Route
//           path="/resources/hld"
//           element={
//             <HLDResources />
//           }
//         />

//         <Route
//           path="/interview/create"
//           element={
//             <AddInterviewExperience />
//           }
//         />

//         {/* Books */}

//         <Route
//           path="/book"
//           element={<BookCallPage />}
//         />

//         <Route
//           path="/books"
//           element={<Books />}
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
//           element={<GenaiMCP />}
//         />

//         <Route
//           path="/book/genai/rag"
//           element={<GenaiRAG />}
//         />

//         {/* HLD Resources */}

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

//         {/* Payment */}

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

//         <Route
//           path="*"
//           element={<NotFoundPage />}
//         />
//       </Routes>

//       <Footer />
//     </div>
//   );
// }

// export default App;
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
        />

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