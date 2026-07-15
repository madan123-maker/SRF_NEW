import React from 'react';
import { useApplications, useCreateDraft } from '../hooks/useApplication';
import { Application } from '../types/application.types';

export const ApplicationDashboard: React.FC = () => {
  const { data, isLoading, error } = useApplications();
  const { mutate: createDraft, isPending: isCreating } = useCreateDraft();

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Applications...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading applications</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Application Workspace</h1>
        <button
          onClick={() => {
            // Ideally open a modal to select Edition, hardcoding an ID for demo purposes if needed
            createDraft('edition-id-here');
          }}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'New Application'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Saved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No applications found. Create a new one to get started.
                </td>
              </tr>
            ) : (
              data?.data.map((app: Application) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.edition?.name || 'Unknown Edition'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.answers?.length || 0} fields answered
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => window.location.href = `/applications/${app.id}`}
                    >
                      {app.status === 'DRAFT' ? 'Resume' : 'View'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
