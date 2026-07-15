/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { SchemaNodeType } from '../types/schema.types';

export interface SelectedNode {
  id: string;
  type: SchemaNodeType;
  parentId?: string;
  data: any; // The entity data
}

interface SchemaStoreState {
  selectedNode: SelectedNode | null;
  expandedNodes: Set<string>;
  isEditing: boolean;
  setSelectedNode: (node: SelectedNode | null) => void;
  toggleNodeExpansion: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useSchemaStore = create<SchemaStoreState>((set) => ({
  selectedNode: null,
  expandedNodes: new Set(),
  isEditing: false,

  setSelectedNode: (node) => set({ selectedNode: node, isEditing: false }),

  toggleNodeExpansion: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    return { expandedNodes: newExpanded };
  }),

  expandNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    newExpanded.add(nodeId);
    return { expandedNodes: newExpanded };
  }),

  collapseNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    newExpanded.delete(nodeId);
    return { expandedNodes: newExpanded };
  }),

  setIsEditing: (isEditing) => set({ isEditing }),
}));
