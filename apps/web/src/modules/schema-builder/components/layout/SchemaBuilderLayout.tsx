import React from 'react';
import { LeftPanelTree } from '../panels/LeftPanelTree';
import { CenterEditor } from '../panels/CenterEditor';
import { RightProperties } from '../panels/RightProperties';

interface SchemaBuilderLayoutProps {
  editionId: string;
}

export const SchemaBuilderLayout: React.FC<SchemaBuilderLayoutProps> = ({ editionId }) => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <LeftPanelTree editionId={editionId} />
      <CenterEditor />
      <RightProperties />
    </div>
  );
};
