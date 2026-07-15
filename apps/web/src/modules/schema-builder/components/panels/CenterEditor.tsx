import React from 'react';
import { useSchemaStore } from '../../stores/useSchemaStore';
import { useSchemaMutations } from '../../hooks/useSchemaMutations';
import { EmptyState } from '../shared/EmptyState';
import { Edit3, Plus, Trash2 } from 'lucide-react';

export const CenterEditor: React.FC = () => {
  const { selectedNode, isEditing, setIsEditing } = useSchemaStore();
  const { deleteNode } = useSchemaMutations();

  if (!selectedNode) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <EmptyState 
          icon={Edit3}
          title="Schema Editor Workspace"
          description="Select a node from the left panel to configure its properties and build your edition schema."
        />
      </div>
    );
  }

  const getChildType = () => {
    switch (selectedNode.type) {
      case 'EDITION': return 'REFORM_AREA';
      case 'REFORM_AREA': return 'ACTION_POINT';
      case 'ACTION_POINT': return 'QUESTION';
      case 'QUESTION': return 'FORM_FIELD';
      default: return null;
    }
  };

  const childType = getChildType();

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
      {/* Toolbar */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {selectedNode.type.replace('_', ' ')} Editor
        </h2>
        <div className="flex items-center space-x-2">
          {childType && (
            <button className="flex items-center px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <Plus size={16} className="mr-1" /> Add {childType.replace('_', ' ')}
            </button>
          )}
          {selectedNode.type !== 'EDITION' && (
            <button 
              onClick={() => {
                if(confirm('Are you sure you want to delete this node?')) {
                  deleteNode.mutate({ type: selectedNode.type, id: selectedNode.id });
                }
              }}
              className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-md transition-colors"
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Workspace */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedNode.data.name || selectedNode.data.label || 'Selected Node'}
            </h3>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Properties'}
            </button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
             {selectedNode.data.description && (
               <p className="mb-4">{selectedNode.data.description}</p>
             )}
             
             {selectedNode.type === 'FORM_FIELD' && (
               <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                 <div><strong>Field Key:</strong> {selectedNode.data.fieldKey}</div>
                 <div><strong>Type:</strong> {selectedNode.data.fieldType}</div>
                 <div><strong>Required:</strong> {selectedNode.data.isRequired ? 'Yes' : 'No'}</div>
               </div>
             )}
          </div>
          
          {isEditing && (
             <div className="mt-8 p-4 border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                   Interactive form editing is active for {selectedNode.type}.
                   (Map React Hook Form fields here in full implementation).
                </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
