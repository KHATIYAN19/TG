import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Mail,
    Image,
    PlusCircle,
    CheckCircle2,
    ListChecks,
    FileText,
    UserPlus, // For Add a user
    UserCog // For User Management
} from 'lucide-react';
import { useSelector } from 'react-redux'; // Assuming you are using React-Redux

const adminRoutes = [
     { path: '/profile', name: 'Profile', icon: UserCog, description: 'View and manage Profile' },
    { path: '/admin/users', name: 'User Management', icon: UserCog, description: 'View, edit, and manage all user accounts.' },
    { path: '/admin/signup', name: 'Add a User', icon: UserPlus, description: 'Create new user accounts for the system.' },
    { path: '/admin/booking', name: 'Bookings', icon: ListChecks, description: 'Manage user bookings and appointments.' },
    { path: '/admin/slots', name: 'Slots', icon: CheckCircle2, description: 'Manage available time slots for bookings.' },
    { path: '/admin/add-blog', name: 'Add Blog', icon: PlusCircle, description: 'Create new blog posts.' },
    { path: '/blog-manage', name: 'Manage Blogs', icon: BookOpen, description: 'Edit and delete existing blog posts.' },
    { path: '/admin/generate-review-link', name: 'Generate Review Link', icon: FileText, description: 'Create links for users to submit reviews.' },
    { path: '/admin/manage-reviews', name: 'Manage Reviews', icon: CheckCircle2, description: 'Approve, edit, and delete user reviews.' },
    { path: '/contact-query', name: 'Contact Queries', icon: Mail, description: 'View and manage user contact form submissions.' },
    { path: '/admin/add-portfolio', name: 'Add Portfolio', icon: PlusCircle, description: 'Add new portfolio items.' },
    { path: '/portfolio-manage', name: 'Manage Portfolio', icon: Image, description: 'Edit and delete portfolio items.' },
    { path: '/admin/affiliate-manage', name: 'Affiliate Management', icon: Users, description: 'Manage Affiliates.' },
];

const employeeRoutes = [
     { path: '/profile', name: 'Profile', icon: UserCog, description: 'View and manage Profile' },
   { path: '/admin/booking', name: 'Bookings', icon: ListChecks, description: 'Manage user bookings and appointments.' },
    { path: '/admin/slots', name: 'Slots', icon: CheckCircle2, description: 'Manage available time slots for bookings.' },
    { path: '/admin/add-blog', name: 'Add Blog', icon: PlusCircle, description: 'Create new blog posts.' },
    { path: '/blog-manage', name: 'Manage Blogs', icon: BookOpen, description: 'Edit and delete existing blog posts.' },
    { path: '/admin/generate-review-link', name: 'Generate Review Link', icon: FileText, description: 'Create links for users to submit reviews.' },
    { path: '/admin/manage-reviews', name: 'Manage Reviews', icon: CheckCircle2, description: 'Approve, edit, and delete user reviews.' },
    { path: '/contact-query', name: 'Contact Queries', icon: Mail, description: 'View and manage user contact form submissions.' },
    { path: '/admin/add-portfolio', name: 'Add Portfolio', icon: PlusCircle, description: 'Add new portfolio items.' },
    { path: '/portfolio-manage', name: 'Manage Portfolio', icon: Image, description: 'Edit and delete portfolio items.' },
    { path: '/admin/affiliate-manage', name: 'Affiliate Management', icon: Users, description: 'Manage Affiliates.' },
];


const AdminDashboard = () => {
    const user = useSelector((state) => state.auth.user); // Get user from Redux store

    const [role, setRole] = useState('');
    const [dashboardTitle, setDashboardTitle] = useState('Dashboard');
    const [currentRoutes, setCurrentRoutes] = useState([]);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            if (user.role === 'admin') {
                setDashboardTitle('Admin Dashboard');
                setCurrentRoutes(adminRoutes);
            } else if (user.role === 'Employee') {
                setDashboardTitle('Employee Dashboard');
                setCurrentRoutes(employeeRoutes);
            }
        } else {
            setRole('');
            setDashboardTitle('Dashboard');
            setCurrentRoutes([]);
        }
    }, [user]);


    if (!user || (role !== 'admin' && role !== 'Employee')) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
                    <p className="text-gray-400 text-lg">You do not have permission to access this page.</p>
                    <Link to="/" className="mt-6">
                        <button className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-blue-400 bg-transparent border border-blue-500/30 rounded-md hover:text-blue-300 hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
                            Back to Home
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-20 mt-20">
            <Helmet>
                <title>{dashboardTitle} - Target Trek</title>
            </Helmet>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                        {dashboardTitle}
                    </h1>
                    <p className="text-gray-600 mt-4">
                        Welcome to the Target Trek {role} dashboard. Manage your site content and settings.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentRoutes.map((route) => {
                        const Icon = route.icon;
                        return (
                            <motion.div
                                key={route.path}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Link to={route.path} className="block">
                                    <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100/20 hover:border-blue-300/20 transition-all duration-300 hover:shadow-blue-200/20">
                                        <div className="flex flex-row items-center gap-4 mb-4">
                                            <Icon className="w-6 h-6 text-blue-600" />
                                            <h2 className="text-lg font-semibold text-blue-800">{route.name}</h2>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">
                                            {route.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;