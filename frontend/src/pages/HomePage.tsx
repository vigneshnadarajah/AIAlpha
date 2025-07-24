import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AIAlpha
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-tenant SaaS Data Visualization Platform
        </p>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Getting Started
          </h2>
          <p className="text-gray-600">
            Your development environment is ready. Start building amazing data visualizations!
          </p>
        </div>
      </div>
    </div>
  );
};