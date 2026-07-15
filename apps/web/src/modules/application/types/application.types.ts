export enum AppStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  CLARIFICATION_REQUESTED = 'CLARIFICATION_REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface ApplicationAnswer {
  id: string;
  applicationId: string;
  questionId: string;
  formFieldId: string;
  valueText?: string | null;
  valueNumeric?: number | null;
  valueBoolean?: boolean | null;
  valueDate?: string | null;
  valueJson?: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  editionId: string;
  organizationId: string;
  submitterId: string;
  status: AppStatus;
  totalScore?: number | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  answers?: ApplicationAnswer[];
  edition?: { id?: string; name?: string; [key: string]: unknown }; // To be typed later based on edition module
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
