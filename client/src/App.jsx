import './App.css'
import { Route, Routes } from 'react-router-dom'


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
import { useSelector } from 'react-redux'
import { useState } from 'react'

function App() {
  const user=useSelector((state)=>state.auth.user);
  const [isAdmin,setisAdmin]=useState(user?.role==="admin");
  return (
    <div className='w-[90%] mx-auto max-h-max font-inter'>
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
        <Route path="/contact-query" element={<ContactList />} />
        <Route path="/blog/:slug" element={<BlogPostDetail />} />
        <Route path="/affiliate-marketing" element={<AffiliateMarketing/>}/>
        <Route path="/portfolio/:slug" element={<PortfolioDetailPage/>}/>




        <Route path="/admin/booking" element={isAdmin ? <AdminBookingsPage /> : <NotFoundPage />} />
      <Route path="/admin/slots" element={isAdmin ? <AdminSlotsPage /> : <NotFoundPage />} />
      <Route path="/admin/add-blog" element={isAdmin ? <AddBlogPage /> : <NotFoundPage />} />
      <Route path="/admin/login" element={!isAdmin ? <LoginPage /> : <NotFoundPage />} />
      <Route path="/admin/generate-review-link" element={isAdmin ? <GenerateReviewLinkPage /> : <NotFoundPage />} />
      <Route path="/admin/manage-reviews" element={isAdmin ? <ManageReviewsPage /> : <NotFoundPage />} />
      <Route path="/contact-details/:id" element={isAdmin ? <ContactDetail /> : <NotFoundPage />} />
      <Route path="/blog-manage" element={isAdmin ? <AdminBlogManagementPage /> : <NotFoundPage />} />
      <Route path="/admin/add-portfolio" element={isAdmin ? <AddPortfolioPage /> : <NotFoundPage />} />
      <Route path="/portfolio-manage" element={isAdmin ? <ManagePortfolio /> : <NotFoundPage />} />




        <Route path="*" element={<NotFoundPage/>}/>



      </Routes>
    

    </div>
  )
}

export default App

