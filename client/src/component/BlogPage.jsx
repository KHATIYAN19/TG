// import React from 'react';
// import { NavLink } from 'react-router-dom'; // For linking to individual posts
// import { ArrowRight, Calendar, User } from 'lucide-react'; // Icons
// import { format, parseISO } from 'date-fns'; // Import date-fns functions

// const BlogPage = () => {

//   // --- Dummy Blog Post Data ---
//   // Replace with actual blog post data fetched from an API or CMS
//   // Using active Unsplash images as placeholders
//   const blogPosts = [
//     {
//       slug: 'seo-trends-2025',
//       title: 'Top SEO Trends to Watch in 2025',
//       excerpt: 'Stay ahead of the curve! Discover the latest SEO strategies and algorithm updates that will shape digital marketing this year.',
//       author: 'Admin',
//       date: '2025-04-15',
//       imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
//       altText: 'Team discussing SEO strategy around a table with laptops',
//       tags: ['SEO', 'Trends', 'Digital Marketing']
//     },
//     {
//       slug: 'content-marketing-roi',
//       title: 'Measuring the ROI of Your Content Marketing Efforts',
//       excerpt: 'Content is king, but how do you prove its value? Learn key metrics and techniques to effectively measure your content marketing return on investment.',
//       author: 'Jane Doe',
//       date: '2025-04-05',
//       imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
//       altText: 'Laptop showing analytics charts and graphs',
//       tags: ['Content Marketing', 'ROI', 'Analytics']
//     },
//     {
//       slug: 'social-media-engagement-tips',
//       title: '5 Actionable Tips to Boost Social Media Engagement',
//       excerpt: 'Struggling to get likes, comments, and shares? Implement these practical tips to increase interaction and build a loyal community on social media.',
//       author: 'Admin',
//       date: '2025-03-28',
//       imageUrl: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
//       altText: 'Smartphone displaying social media interface with like icons',
//       tags: ['Social Media', 'Engagement', 'Tips']
//     },
//      {
//       slug: 'ppc-beginners-guide',
//       title: 'PPC Advertising: A Beginner\'s Guide to Getting Started',
//       excerpt: 'New to Pay-Per-Click? This guide covers the basics of setting up your first campaign, choosing keywords, and understanding key metrics.',
//       author: 'John Smith',
//       date: '2025-03-12',
//       imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80', // Reusing image
//       altText: 'Team collaborating on a project with sticky notes',
//       tags: ['PPC', 'Advertising', 'Beginners']
//     },
//      {
//       slug: 'email-marketing-automation',
//       title: 'Leveraging Automation in Your Email Marketing Strategy',
//       excerpt: 'Save time and deliver personalized experiences with email marketing automation. Explore tools and techniques for effective automated campaigns.',
//       author: 'Admin',
//       date: '2025-02-25',
//       imageUrl: 'https://images.unsplash.com/photo-1553708881-191426534b33?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
//       altText: 'Abstract image representing automation and data flow',
//       tags: ['Email Marketing', 'Automation', 'Strategy']
//     },
//     // Add more blog posts as needed
//   ];

//   return (
//     // Added padding top to avoid overlap with fixed navbar
//     <div className="pt-20 bg-white min-h-screen">

//       {/* Page Header */}
//       <section className="py-16 bg-gradient-to-r from-gray-100 to-gray-200 text-center border-b border-gray-300">
//         <div className="max-w-4xl mx-auto px-4">
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Digital Marketing Insights</h1>
//           <p className="text-lg md:text-xl text-gray-600">
//             Stay updated with the latest trends, tips, and strategies from our experts.
//           </p>
//         </div>
//       </section>

//       {/* Blog Post Grid */}
//       <section className="py-16 lg:py-24">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {blogPosts.length === 0 ? (
//             <p className="text-center text-gray-500 text-lg">No blog posts available yet. Check back soon!</p>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
//               {blogPosts.map((post) => {
//                 // Safely parse the date
//                 let formattedDate = 'Invalid Date';
//                 try {
//                     const parsed = parseISO(post.date);
//                     formattedDate = format(parsed, 'MMM d, yyyy');
//                 } catch (e) {
//                     console.error(`Could not parse date: ${post.date}`);
//                 }

//                 return (
//                     <div key={post.slug} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition duration-300 ease-in-out hover:shadow-2xl group">
//                     {/* Blog Post Image */}
//                     <NavLink to={`/blog/${post.slug}`} className="block overflow-hidden">
//                         <img
//                         src={post.imageUrl}
//                         alt={post.altText}
//                         className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
//                         onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/e0e0e0/757575?text=Blog+Image"; }}
//                         />
//                     </NavLink>

//                     {/* Blog Post Content */}
//                     <div className="p-6 flex flex-col flex-grow">
//                         {/* Tags (Optional) */}
//                         {post.tags && (
//                             <div className="mb-2">
//                                 {post.tags.slice(0, 2).map(tag => ( // Show max 2 tags
//                                     <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
//                                         {tag}
//                                     </span>
//                                 ))}
//                             </div>
//                         )}
//                         <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition duration-150 ease-in-out">
//                         <NavLink to={`/blog/${post.slug}`}>
//                             {post.title}
//                         </NavLink>
//                         </h3>
//                         <p className="text-gray-600 text-sm mb-4 flex-grow">
//                         {post.excerpt}
//                         </p>

//                         {/* Meta Info & Read More */}
//                         <div className="mt-auto border-t border-gray-100 pt-4">
//                             <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
//                                 <div className="flex items-center">
//                                     <User size={14} className="mr-1.5"/> {post.author}
//                                 </div>
//                                 <div className="flex items-center">
//                                     <Calendar size={14} className="mr-1.5"/> {formattedDate} {/* Use the formatted date */}
//                                 </div>
//                             </div>
//                             <NavLink
//                                 to={`/blog/${post.slug}`}
//                                 className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group-hover:underline"
//                             >
//                                 Read More
//                                 <ArrowRight size={16} className="ml-1 transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
//                             </NavLink>
//                         </div>
//                     </div>
//                     </div>
//                 );
//               })}
//             </div>
//           )}
        
//         </div>
//       </section>

//     </div>
//   );
// };

// export default BlogPage;
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, User, Loader2, AlertTriangle, BookOpen } from 'lucide-react';
import BASE_URL from "../utils/Url.js"; // Adjust path as needed
import toast, { Toaster } from 'react-hot-toast';

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_URL}/blogs`);
        if (response.data.success) {
          setBlogPosts(response.data.data || []);
        } else {
          throw new Error(response.data.error?.message || 'Failed to fetch posts');
        }
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setError(err.message || 'An error occurred while fetching blog posts.');
        toast.error(err.message || 'Could not load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString) => {
    try {
      const parsed = parseISO(dateString);
      return format(parsed, 'MMM d, yyyy');
    } catch (e) {
      console.error(`Could not parse date: ${dateString}`);
      return 'Invalid Date';
    }
  };

  const handleCardClick = (slug) => {
    navigate(`/blog/${slug}`);
  };

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-20">
      <Toaster position="top-center" reverseOrder={false} />

      <section className="py-16 bg-gradient-to-r from-gray-100 to-gray-200 text-center border-b border-gray-300">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">Digital Marketing Insights</h1>
          <p className="text-lg md:text-xl text-gray-600">
            Stay updated with the latest trends, tips, and strategies from our experts.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
              <span className="ml-3 text-gray-600 text-lg">Loading Posts...</span>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md flex items-center justify-center" role="alert">
              <AlertTriangle className="mr-3" size={24}/>
              <div>
                  <p className="font-bold">Error Loading Posts</p>
                  <p>{error}</p>
              </div>
            </div>
          ) : blogPosts.length === 0 ? (
             <div className="text-center py-20 px-6 bg-white rounded-lg shadow-md">
                 <BookOpen className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Blog Posts Yet!</h2>
                <p className="text-gray-500">
                    We're working on creating insightful content. Please check back soon!
                </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {blogPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition duration-300 ease-in-out hover:shadow-2xl group cursor-pointer"
                  onClick={() => handleCardClick(post.slug)}
                >
                  <div className="block overflow-hidden h-48">
                    <img
                      src={post.imageUrl || "https://placehold.co/600x400/e0e0e0/757575?text=Blog+Image"}
                      alt={post.altText || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/e0e0e0/757575?text=Blog+Image"; }}
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    {post.tags && (
                      <div className="mb-2">
                        {post.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full capitalize">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition duration-150 ease-in-out min-h-[56px]">
                      {post.title}
                    </h3>
                    {/* --- Updated Excerpt Display --- */}
                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {truncateText(post.excerpt, 100)}
                    </p>
                    {/* --- End Updated Excerpt Display --- */}

                    <div className="mt-auto border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <User size={14} className="mr-1.5"/> {post.author}
                        </div>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1.5"/> {formatDate(post.createdAt)}
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 group-hover:underline"
                      >
                        Read More
                        <ArrowRight size={16} className="ml-1 transition-transform duration-200 ease-in-out group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
