import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import BASE_URL from "../utils/Url.js"; // Assuming this path is correct

function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_URL}/portfolio/published`);
        if (response.data && response.data.success) {
          setPortfolioItems(response.data.data || response.data.items || []);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch portfolio items');
        }
      } catch (err) {
        console.error("Failed to fetch portfolio items:", err);
        const message = err.response?.data?.message || err.message || 'Failed to load portfolio. Please try again later.';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto">

          {!isLoading && !error && portfolioItems.length > 0 && (
            <div className="mb-16 sm:mb-20 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-700 mb-6 tracking-tight leading-tight">
                Our Showcase of Success
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover how we've helped businesses like yours achieve remarkable results with impactful digital strategies and captivating designs.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-xl text-gray-600 font-medium">Loading Projects...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10 px-6 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg max-w-lg mx-auto shadow-md">
              <div className="flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl font-semibold">Loading Failed</p>
              </div>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && portfolioItems.length === 0 && (
            <div className="text-center py-20 px-4 mt-12">
              <div className="animate-pulse mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a4 4 0 00-5.656 0M14 10l-2 2m0 0l-2-2m2 2v4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3"/>
                </svg>
              </div>
              <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Portfolio is Coming Soon!</h2>
              <p className="text-lg text-gray-500 max-w-md mx-auto leading-relaxed">
                We're currently curating our best work to showcase. Please check back shortly to see the amazing projects we've delivered!
              </p>
            </div>
          )}

          {!isLoading && !error && portfolioItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {portfolioItems.map((item) => (
                <Link
                  key={item._id || item.slug}
                  to={`/portfolio/${item.slug}`}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200/50 flex flex-col group transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.altText || item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src=`https://placehold.co/600x338/E0E7FF/4B5563?text=Image+Not+Available`;
                          e.target.alt = 'Image not available';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                      {item.category || 'Uncategorized'}
                    </p>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed flex-grow mb-5 line-clamp-3">
                      {item.description}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-auto pt-5 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-100 group-hover:bg-blue-100 transition-colors duration-200"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                              +{item.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default PortfolioPage;
