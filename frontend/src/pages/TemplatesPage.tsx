import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Template {
  id: string;
  name: string;
  description: string;
  database: string;
  tableCount: number;
  category: string;
  color: string;
  tables: any[];
  relationships: any[];
}

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();

  const templates: Template[] = [
    {
      id: 'ecommerce',
      name: 'E-commerce Store',
      description: 'Complete schema for online store with products, orders, users, and payments',
      database: 'PostgreSQL',
      tableCount: 8,
      category: 'Business',
      color: 'bg-blue-100 text-blue-800',
      tables: [
        {
          id: 'users-table',
          name: 'users',
          x: 50,
          y: 100,
          columns: [
            { id: 'users-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'users-email', name: 'email', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'users-first_name', name: 'first_name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'users-last_name', name: 'last_name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'users-password_hash', name: 'password_hash', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'users-created_at', name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false }
          ]
        },
        {
          id: 'products-table',
          name: 'products',
          x: 400,
          y: 100,
          columns: [
            { id: 'products-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'products-name', name: 'name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'products-description', name: 'description', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true },
            { id: 'products-price', name: 'price', type: 'DECIMAL', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'products-stock', name: 'stock', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'products-category_id', name: 'category_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'categories', referencedColumn: 'id' }
          ]
        },
        {
          id: 'categories-table',
          name: 'categories',
          x: 750,
          y: 100,
          columns: [
            { id: 'categories-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'categories-name', name: 'name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'categories-description', name: 'description', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true }
          ]
        },
        {
          id: 'orders-table',
          name: 'orders',
          x: 50,
          y: 400,
          columns: [
            { id: 'orders-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'orders-user_id', name: 'user_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'users', referencedColumn: 'id' },
            { id: 'orders-total_amount', name: 'total_amount', type: 'DECIMAL', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'orders-status', name: 'status', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'orders-created_at', name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false }
          ]
        },
        {
          id: 'order_items-table',
          name: 'order_items',
          x: 400,
          y: 400,
          columns: [
            { id: 'order_items-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'order_items-order_id', name: 'order_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'orders', referencedColumn: 'id' },
            { id: 'order_items-product_id', name: 'product_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'products', referencedColumn: 'id' },
            { id: 'order_items-quantity', name: 'quantity', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'order_items-price', name: 'price', type: 'DECIMAL', isPrimaryKey: false, isForeignKey: false, isNullable: false }
          ]
        }
      ],
      relationships: [
        { id: 'rel-1', fromTable: 'categories', fromColumn: 'id', toTable: 'products', toColumn: 'category_id' },
        { id: 'rel-2', fromTable: 'users', fromColumn: 'id', toTable: 'orders', toColumn: 'user_id' },
        { id: 'rel-3', fromTable: 'orders', fromColumn: 'id', toTable: 'order_items', toColumn: 'order_id' },
        { id: 'rel-4', fromTable: 'products', fromColumn: 'id', toTable: 'order_items', toColumn: 'product_id' }
      ]
    },
    {
      id: 'blog',
      name: 'Blog System',
      description: 'Blog platform with posts, comments, categories, and user management',
      database: 'MySQL',
      tableCount: 5,
      category: 'Content',
      color: 'bg-green-100 text-green-800',
      tables: [
        {
          id: 'users-table',
          name: 'users',
          x: 50,
          y: 100,
          columns: [
            { id: 'users-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'users-username', name: 'username', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'users-email', name: 'email', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'users-password_hash', name: 'password_hash', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'users-role', name: 'role', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false }
          ]
        },
        {
          id: 'posts-table',
          name: 'posts',
          x: 400,
          y: 100,
          columns: [
            { id: 'posts-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'posts-title', name: 'title', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'posts-content', name: 'content', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'posts-author_id', name: 'author_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'users', referencedColumn: 'id' },
            { id: 'posts-category_id', name: 'category_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'categories', referencedColumn: 'id' },
            { id: 'posts-published_at', name: 'published_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: true }
          ]
        },
        {
          id: 'categories-table',
          name: 'categories',
          x: 750,
          y: 100,
          columns: [
            { id: 'categories-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'categories-name', name: 'name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'categories-slug', name: 'slug', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false }
          ]
        },
        {
          id: 'comments-table',
          name: 'comments',
          x: 400,
          y: 400,
          columns: [
            { id: 'comments-id', name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isNullable: false },
            { id: 'comments-post_id', name: 'post_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'posts', referencedColumn: 'id' },
            { id: 'comments-author_id', name: 'author_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isNullable: false, referencedTable: 'users', referencedColumn: 'id' },
            { id: 'comments-content', name: 'content', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: false },
            { id: 'comments-created_at', name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false }
          ]
        }
      ],
      relationships: [
        { id: 'rel-1', fromTable: 'users', fromColumn: 'id', toTable: 'posts', toColumn: 'author_id' },
        { id: 'rel-2', fromTable: 'categories', fromColumn: 'id', toTable: 'posts', toColumn: 'category_id' },
        { id: 'rel-3', fromTable: 'posts', fromColumn: 'id', toTable: 'comments', toColumn: 'post_id' },
        { id: 'rel-4', fromTable: 'users', fromColumn: 'id', toTable: 'comments', toColumn: 'author_id' }
      ]
    }
  ];

  const useTemplate = async (template: Template) => {
    if (!isAuthenticated || !token) {
      alert('Please login to use templates');
      return;
    }

    try {
      const diagramData = {
        title: template.name,
        canvas_data: JSON.stringify({
          tables: template.tables,
          relationships: template.relationships
        }),
        description: template.description
      };

              const response = await fetch('/api/diagrams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(diagramData)
      });

      if (response.ok) {
        const result = await response.json();
        navigate(`/diagram/${result.data.id}`);
      } else {
        alert('Failed to create diagram from template');
      }
    } catch (error) {
      console.error('Error creating diagram:', error);
      alert('Failed to create diagram from template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Templates</h1>
          <p className="text-gray-600">Start your project with pre-built database schemas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <span className="text-xs text-gray-500 font-medium">{template.category}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${template.color}`}>
                  {template.database}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{template.tableCount}</span> tables
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{template.relationships.length}</span> relationships
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => useTemplate(template)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Use Template
              </button>
            </div>
          ))}
          
          {/* Coming Soon Templates */}
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">More Templates Coming Soon</h3>
            <p className="text-sm text-gray-500">We're working on more database templates for different use cases</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 