import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Diagram {
  id: string;
  title: string;
  description?: string;
  canvas_data: any;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export const DiagramsPage: React.FC = () => {
  const { token } = useAuthStore();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiagrams = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:5000/api/diagrams', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDiagrams(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching diagrams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagrams();
  }, [token]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getTableCount = (canvasData: any) => {
    try {
      if (canvasData?.tables) return canvasData.tables.length;
      return 0;
    } catch {
      return 0;
    }
  };

  const deleteDiagram = async (diagramId: string) => {
    if (!confirm('Are you sure you want to delete this diagram?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/diagrams/${diagramId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDiagrams(diagrams.filter(d => d.id !== diagramId));
      }
    } catch (error) {
      console.error('Error deleting diagram:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Diagrams</h1>
          <Link 
            to="/editor"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            New Diagram
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading diagrams...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diagrams.map((diagram) => (
              <div key={diagram.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{diagram.title}</h3>
                    {diagram.description && (
                      <p className="text-sm text-gray-600 mb-2">{diagram.description}</p>
                    )}
                    <p className="text-sm text-gray-500">PostgreSQL • {getTableCount(diagram.canvas_data)} tables</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    diagram.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {diagram.visibility}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Modified {formatTimeAgo(diagram.updated_at)}</span>
                  <div className="flex space-x-2">
                    <Link
                      to={`/diagram/${diagram.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteDiagram(diagram.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/editor"
              className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-100 transition-colors"
            >
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Diagram</h3>
                <p className="text-sm text-gray-500">Start designing your database schema</p>
              </div>
            </Link>
          </div>
        )}

        {!isLoading && diagrams.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-400 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No diagrams yet</h3>
            <p className="text-gray-500 mb-6">Create your first database diagram to get started</p>
            <Link
              to="/editor"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Diagram
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}; 