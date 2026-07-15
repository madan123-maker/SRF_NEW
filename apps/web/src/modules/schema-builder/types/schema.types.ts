/* eslint-disable @typescript-eslint/no-explicit-any */
export type SchemaNodeType = 'EDITION' | 'REFORM_AREA' | 'ACTION_POINT' | 'QUESTION' | 'FORM_FIELD';

export interface FormField {
  id: string;
  questionId: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  placeholder?: string | null;
  helpText?: string | null;
  description?: string | null;
  defaultValue?: string | null;
  validationRules?: Record<string, any> | null;
  options?: Record<string, any> | null;
  displayOrder: number;
  width?: string | null;
  section?: string | null;
  isRequired: boolean;
  isReadOnly: boolean;
  isHidden: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isExportable: boolean;
  status: string;
  metadata?: Record<string, any> | null;
}

export interface Question {
  id: string;
  actionPointId: string;
  name: string;
  code: string;
  slug: string;
  description?: string | null;
  helpText?: string | null;
  instruction?: string | null;
  displayOrder: number;
  isRequired: boolean;
  isRepeatable: boolean;
  status: string;
  metadata?: Record<string, any> | null;
  fields?: FormField[];
}

export interface ActionPoint {
  id: string;
  reformAreaId: string;
  name: string;
  code: string;
  slug: string;
  description?: string | null;
  objective?: string | null;
  guidance?: string | null;
  helpText?: string | null;
  displayOrder: number;
  status: string;
  metadata?: Record<string, any> | null;
  questions?: Question[];
}

export interface ReformArea {
  id: string;
  editionId: string;
  name: string;
  code: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  displayOrder: number;
  maxScore: number;
  status: string;
  metadata?: Record<string, any> | null;
  actionPoints?: ActionPoint[];
}

export interface Edition {
  id: string;
  organizationId: string;
  departmentId?: string | null;
  name: string;
  description?: string | null;
  financialYear: string;
  status: string;
  majorVersion: number;
  minorVersion: number;
  totalMarks: number;
  isLocked: boolean;
  visibility: string;
  reformAreas?: ReformArea[];
}
