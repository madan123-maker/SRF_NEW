import React from 'react';
import { ChevronRight, ChevronDown, Folder, FileText, CheckSquare, Hash } from 'lucide-react';
import { SchemaNodeType } from '../../types/schema.types';

interface TreeItemProps {
  id: string;
  label: string;
  type: SchemaNodeType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  onToggle: (id: string) => void;
  onSelect: () => void;
}

const typeIcons: Record<SchemaNodeType, React.ReactNode> = {
  EDITION: <Folder size={16} className="text-blue-500" />,
  REFORM_AREA: <Folder size={16} className="text-orange-500" />,
  ACTION_POINT: <FileText size={16} className="text-green-500" />,
  QUESTION: <CheckSquare size={16} className="text-purple-500" />,
  FORM_FIELD: <Hash size={16} className="text-gray-500" />
};

export const TreeItem: React.FC<TreeItemProps> = ({
  id,
  label,
  type,
  level,
  isExpanded,
  isSelected,
  hasChildren,
  onToggle,
  onSelect
}) => {
  return (
    <div 
      className={`flex items-center py-1.5 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' : ''}`}
      style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div 
        className="w-5 h-5 flex items-center justify-center mr-1"
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) onToggle(id);
        }}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />
        ) : <span className="w-4" />}
      </div>
      <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-ellipsis text-sm text-gray-700 dark:text-gray-300">
        {typeIcons[type]}
        <span className="truncate">{label}</span>
      </div>
    </div>
  );
};
