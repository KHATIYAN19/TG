import './App.css'
import { Route, Routes } from 'react-router-dom'
import { logout } from './Redux/authSlice';
  import { getTokenExpiryFromLocalStorage } from './Redux/authSlice.js';
import toast, { Toaster } from 'react-hot-toast'; 
  import { useDispatch } from 'react-redux';
import Navbar from './component/Navbar'
import HomePage from './component/HomePage'
import BookCallPage from './component/BookCallPage'
import ServicesPage from './component/ServicesPage'
import ContactPage from './component/ContactPage'
import BlogPage from './component/BlogPage'
import PortfolioPage from './component/PortfolioPage'
import AboutPage from './component/AboutPage'
import SubmitReviewPage from "./component/SumbitReviewPage"
import BlogPostDetail from './component/BlogPostDetail'
import AffiliateMarketing from './component/AffiliateMarketing'
import NotFoundPage from './component/NotFoundPage'
import PortfolioDetailPage from './component/PortfolioDetailPage'


import AdminBlogManagementPage from './Admin/AdminBlogList'
import AdminBookingsPage from './Admin/AdminBookingsPage'
import AdminSlotsPage from './Admin/AdminSlotsPage'
import AddBlogPage from './Admin/AddBlogPage';
import LoginPage from './Admin/LoginPage'
import GenerateReviewLinkPage from './Admin/GenerateReview'
import ManageReviewsPage from "./Admin/ManageReviewPage"
import ContactList from './Admin/ContactList'
import ContactDetail from './Admin/ContactDetails'
import AddPortfolioPage from './Admin/AddPortfolioPage'
import ManagePortfolio from './Admin/ManagePortFolio'
import AffiliateList from './Admin/AffiliateList.jsx'


import AdminSignup from './Admin/AdminSignup.jsx'

import AdminDashboard from './Admin/AdminDashBoard.jsx'
import FloatingContact from './component/FloatingContact.jsx'
import Footer from './component/Footer.jsx'
import PrivacyPolicy from './component/PrivacyPolicy.jsx'
import TermsOfService from './component/TermsOfService.jsx'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'

import UserManagement  from "./Admin/UserManagement.jsx"
import { Home } from 'lucide-react'

function App() {
  const user=useSelector((state)=>state.auth.user);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const dispatch = useDispatch();

 useEffect(() => {
  const intervalId = setInterval(() => {
    const expiry = getTokenExpiryFromLocalStorage();
    if (expiry && Date.now() > expiry) {
      dispatch(logout());
      toast.error("Session expired. You have been logged out.");
      clearInterval(intervalId); 
    }
  }, 5000); 

  return () => clearInterval(intervalId);
}, []); 


  useEffect(() => {
    if (user) {
      const adminStatus = user.role === "admin";
      const employeeStatus = user.role === "Employee";
      setIsAdmin(adminStatus);
      setIsEmployee(employeeStatus);
      setIsUser(adminStatus || employeeStatus);
    } else {
      setIsAdmin(false);
      setIsEmployee(false);
      setIsUser(false);
    }
  }, [user]); 
  return (
    <div className='w-[90%] mx-auto max-h-max font-inter'>
       <Toaster /> 
      <div className=''>
          <Navbar />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookCallPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blogs" element={<BlogPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/submit-review/:token" element={<SubmitReviewPage />} />
        <Route path="/blog/:slug" element={<BlogPostDetail />} />
        <Route path="/affiliate-marketing" element={<AffiliateMarketing/>}/>
        <Route path="/portfolio/:slug" element={<PortfolioDetailPage/>}/>
     <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>
        <Route path="/terms-of-service" element={<TermsOfService/>}/>

   

        <Route path="/admin/login" element={!isUser ? <LoginPage /> : <HomePage />} />
        
        <Route path="/admin/add-blog" element={isUser ? <AddBlogPage /> : <NotFoundPage />} />

        <Route path="/dashboard" element={isUser ? <AdminDashboard /> : <NotFoundPage />} />
        <Route path="/contact-query" element={isUser?<ContactList />:<NotFoundPage/>} />
        <Route path="/admin/affiliate-manage" element={isUser ? <AffiliateList /> : <NotFoundPage />} />
         <Route path="/admin/generate-review-link" element={isUser ? <GenerateReviewLinkPage /> : <NotFoundPage />} />
        <Route path="/admin/manage-reviews" element={isUser ? <ManageReviewsPage /> : <NotFoundPage />} />
        <Route path="/contact-details/:id" element={isUser ? <ContactDetail /> : <NotFoundPage />} />
        <Route path="/blog-manage" element={isUser ? <AdminBlogManagementPage /> : <NotFoundPage />} />
        <Route path="/admin/add-portfolio" element={isUser ? <AddPortfolioPage /> : <NotFoundPage />} />
        <Route path="/portfolio-manage" element={isUser ? <ManagePortfolio /> : <NotFoundPage />} />
       
       
        <Route path="/admin/users" element={isAdmin?<UserManagement/>:<NotFoundPage/>}/>
        <Route path="/admin/signup" element={isAdmin?<AdminSignup/>:<HomePage/>}/>
    





       
        <Route path="/admin/booking" element={isAdmin ? <AdminBookingsPage /> : <NotFoundPage />} />
        <Route path="/admin/slots" element={isAdmin ? <AdminSlotsPage /> : <NotFoundPage />} />
        


        
        
        <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
       <FloatingContact/>
       <Footer/>
    </div>
  )
}

export default App;
