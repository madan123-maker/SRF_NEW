import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SchemaBuilderLayout } from '../components/layout/SchemaBuilderLayout';
import { ArrowLeft } from 'lucide-react';
import { useEditionDetails } from '../hooks/useSchemaHierarchy';

export const SchemaBuilderPage: React.FC = () => {
  const { editionId } = useParams<{ editionId: string }>();
  const { data: edition, isLoading, isError } = useEditionDetails(editionId);
  
  if (!editionId) {
    return <div className="p-8 text-red-500">Edition ID is required.</div>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading Schema Builder...</div>;
  }

  if (isError || !edition) {
    return <div className="flex items-center justify-center h-screen text-red-500">Failed to load Edition.</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Top Header */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link to="/editions" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              Schema Builder: {edition.name}
              {edition.isLocked && <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-md">LOCKED</span>}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {edition.financialYear} v{edition.majorVersion}.{edition.minorVersion}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Preview
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
            Save Schema
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <SchemaBuilderLayout editionId={editionId} />
    </div>
  );
};

export default SchemaBuilderPage;
