import React from 'react';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 font-sans p-4">
      <div className="text-center space-y-8 transform transition-all duration-500 hover:scale-105">
        <h1 className="text-8xl md:text-9xl font-extrabold text-blue-600 animate-pulse">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-blue-800">
          Oops! Page Not Found
        </p>
        <p className="text-md md:text-lg text-blue-700 max-w-md mx-auto">
          It looks like the page you're looking for doesn't exist or has been moved.
        </p>
        {/* <a
          href="/"
          className="inline-block px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out"
        >
          Go Home
        </a> */}
      </div>
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-20">
        <div className="absolute inset-0 bg-blue-300 rounded-full opacity-50 animate-ping"></div>
        <div className="absolute inset-2 bg-blue-400 rounded-full opacity-75 animate-ping delay-150"></div>
      </div>
    </div>
  );
}

export default NotFoundPage; 
