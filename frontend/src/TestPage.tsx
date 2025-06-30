import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        ✅ React App is Working!
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>System Status:</h2>
        <ul>
          <li>✅ React: {React.version}</li>
          <li>✅ Component rendering: Working</li>
          <li>✅ CSS: Loading</li>
          <li>✅ JavaScript: Executing</li>
        </ul>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => alert('Button works!')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Button
          </button>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Current time: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TestPage; 