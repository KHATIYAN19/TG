import { Helmet } from "react-helmet";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, User, Loader2, AlertTriangle, BookOpen } from 'lucide-react';
import BASE_URL from "../utils/Url.js";
import toast, { Toaster } from 'react-hot-toast';

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on component mount (initial load)
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

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [navigate]);

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

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-20">
      <Helmet>
        <title>Blog - Target Trek</title>
        <meta name="description" content="Explore the latest digital marketing insights, trends, and strategies on the Target Trek blog." />
        <meta property="og:title" content="Blog - Target Trek" />
        <meta property="og:description" content="Explore the latest digital marketing insights, trends, and strategies on the Target Trek blog." />
        <meta property="og:type" content="website" />
        {/* You can add more SEO-related meta tags here */}
      </Helmet>
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
                    <p className="text-gray-600 text-sm mb-4 flex-grow">
                      {truncateText(post.excerpt, 100)}
                    </p>

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