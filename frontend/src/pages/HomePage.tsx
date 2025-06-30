import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">DrawSQL Clone</h1>
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Beautiful database diagrams
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Design, visualize and collaborate on entity relationship diagrams for your databases.
          </p>
          <div className="space-x-4">
            <Link 
              to="/register" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
            >
              Get started
            </Link>
            <Link 
              to="/templates" 
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg border hover:bg-gray-50"
            >
              View templates
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Visual Design</h3>
            <p className="text-gray-600">
              Drag-and-drop interface for creating beautiful database tables.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Real-time Collaboration</h3>
            <p className="text-gray-600">
              Work together with your team in real-time.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Multiple Databases</h3>
            <p className="text-gray-600">
              Support for PostgreSQL, MySQL, and more.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}; 