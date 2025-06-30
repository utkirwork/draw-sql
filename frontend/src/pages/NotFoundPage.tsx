import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mx-auto h-32 w-32 text-gray-400 mb-8">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1" 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.002-5.824-2.651M15 17H9m6-2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2m8-2V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
          </div>

          {/* Error Code */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          
          {/* Error Message */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Sorry, the page you are looking for doesn't exist or has been moved. 
            Let's get you back to creating amazing database diagrams!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Go Home
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Popular pages:
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/diagrams" className="text-blue-600 hover:text-blue-800">
                My Diagrams
              </Link>
              <Link to="/templates" className="text-blue-600 hover:text-blue-800">
                Templates
              </Link>
              <Link to="/profile" className="text-blue-600 hover:text-blue-800">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-xs text-gray-400">
          DrawSQL Clone - Professional Database Schema Designer
        </p>
      </div>
    </div>
  );
}; 