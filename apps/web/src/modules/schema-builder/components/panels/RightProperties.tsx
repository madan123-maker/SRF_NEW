import React from 'react';
import { useSchemaStore } from '../../stores/useSchemaStore';

export const RightProperties: React.FC = () => {
  const { selectedNode } = useSchemaStore();

  if (!selectedNode) {
    return (
      <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
        <p className="text-sm text-gray-500 text-center mt-10">No node selected</p>
      </div>
    );
  }

  const { data } = selectedNode;

  return (
    <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col h-full overflow-hidden">
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Properties</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Core Metadata */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System Metadata</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block mb-1">ID</span>
              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200 select-all">
                {data.id}
              </span>
            </div>
            {data.code && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 block mb-1">Code</span>
                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">
                  {data.code}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-500 dark:text-gray-400 block mb-1">Status</span>
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                data.status === 'ACTIVE' || data.status === 'PUBLISHED' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {data.status || 'UNKNOWN'}
              </span>
            </div>
          </div>
        </div>

        {/* Node Specific Config */}
        {selectedNode.type === 'FORM_FIELD' && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Field Configuration</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Required</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{data.isRequired ? 'True' : 'False'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Read Only</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{data.isReadOnly ? 'True' : 'False'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Hidden</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{data.isHidden ? 'True' : 'False'}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
