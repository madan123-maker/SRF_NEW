/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useSchemaStore } from '../../stores/useSchemaStore';
import { useReformAreas, useActionPoints, useQuestions, useFormFields } from '../../hooks/useSchemaHierarchy';
import { TreeItem } from '../shared/TreeItem';
import { Loader2 } from 'lucide-react';

// Recursive Tree Node Components
const FormFieldNode = ({ field, parentId }: { field: any, parentId: string }) => {
  const { selectedNode, setSelectedNode } = useSchemaStore();
  
  return (
    <TreeItem
      id={field.id}
      label={`${field.fieldKey}: ${field.label}`}
      type="FORM_FIELD"
      level={4}
      isExpanded={false}
      isSelected={selectedNode?.id === field.id}
      hasChildren={false}
      onToggle={() => {}}
      onSelect={() => setSelectedNode({ id: field.id, type: 'FORM_FIELD', parentId, data: field })}
    />
  );
};

const QuestionNode = ({ question, parentId }: { question: any, parentId: string }) => {
  const { selectedNode, expandedNodes, toggleNodeExpansion, setSelectedNode } = useSchemaStore();
  const isExpanded = expandedNodes.has(question.id);
  const { data: fields, isLoading } = useFormFields(isExpanded ? question.id : undefined);

  return (
    <div>
      <TreeItem
        id={question.id}
        label={question.code ? `[${question.code}] ${question.name}` : question.name}
        type="QUESTION"
        level={3}
        isExpanded={isExpanded}
        isSelected={selectedNode?.id === question.id}
        hasChildren={true}
        onToggle={toggleNodeExpansion}
        onSelect={() => setSelectedNode({ id: question.id, type: 'QUESTION', parentId, data: question })}
      />
      {isExpanded && (
        <div>
          {isLoading && <div className="pl-12 py-1 text-xs text-gray-500">Loading...</div>}
          {fields?.map((f: any) => <FormFieldNode key={f.id} field={f} parentId={question.id} />)}
        </div>
      )}
    </div>
  );
};

const ActionPointNode = ({ actionPoint, parentId }: { actionPoint: any, parentId: string }) => {
  const { selectedNode, expandedNodes, toggleNodeExpansion, setSelectedNode } = useSchemaStore();
  const isExpanded = expandedNodes.has(actionPoint.id);
  const { data: questions, isLoading } = useQuestions(isExpanded ? actionPoint.id : undefined);

  return (
    <div>
      <TreeItem
        id={actionPoint.id}
        label={actionPoint.code ? `[${actionPoint.code}] ${actionPoint.name}` : actionPoint.name}
        type="ACTION_POINT"
        level={2}
        isExpanded={isExpanded}
        isSelected={selectedNode?.id === actionPoint.id}
        hasChildren={true}
        onToggle={toggleNodeExpansion}
        onSelect={() => setSelectedNode({ id: actionPoint.id, type: 'ACTION_POINT', parentId, data: actionPoint })}
      />
      {isExpanded && (
        <div>
          {isLoading && <div className="pl-8 py-1 text-xs text-gray-500">Loading...</div>}
          {questions?.map((q: any) => <QuestionNode key={q.id} question={q} parentId={actionPoint.id} />)}
        </div>
      )}
    </div>
  );
};

const ReformAreaNode = ({ reformArea, parentId }: { reformArea: any, parentId: string }) => {
  const { selectedNode, expandedNodes, toggleNodeExpansion, setSelectedNode } = useSchemaStore();
  const isExpanded = expandedNodes.has(reformArea.id);
  const { data: actionPoints, isLoading } = useActionPoints(isExpanded ? reformArea.id : undefined);

  return (
    <div>
      <TreeItem
        id={reformArea.id}
        label={reformArea.name}
        type="REFORM_AREA"
        level={1}
        isExpanded={isExpanded}
        isSelected={selectedNode?.id === reformArea.id}
        hasChildren={true}
        onToggle={toggleNodeExpansion}
        onSelect={() => setSelectedNode({ id: reformArea.id, type: 'REFORM_AREA', parentId, data: reformArea })}
      />
      {isExpanded && (
        <div>
          {isLoading && <div className="pl-6 py-1 text-xs text-gray-500">Loading...</div>}
          {actionPoints?.map((ap: any) => <ActionPointNode key={ap.id} actionPoint={ap} parentId={reformArea.id} />)}
        </div>
      )}
    </div>
  );
};

export const LeftPanelTree: React.FC<{ editionId: string }> = ({ editionId }) => {
  const { data: reformAreas, isLoading } = useReformAreas(editionId);
  const { selectedNode, setSelectedNode } = useSchemaStore();

  return (
    <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Edition Hierarchy</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-4 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={16} /> Loading hierarchy...
          </div>
        ) : (
          <div>
            <TreeItem
              id={editionId}
              label="Root Edition"
              type="EDITION"
              level={0}
              isExpanded={true}
              isSelected={selectedNode?.id === editionId}
              hasChildren={true}
              onToggle={() => {}}
              onSelect={() => setSelectedNode({ id: editionId, type: 'EDITION', data: { id: editionId } })}
            />
            {reformAreas?.map((ra: any) => <ReformAreaNode key={ra.id} reformArea={ra} parentId={editionId} />)}
          </div>
        )}
      </div>
    </div>
  );
};
