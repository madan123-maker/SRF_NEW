export interface CreateApplicationDto {
  editionId: string;
}

export interface UpdateAnswersDto {
  answers: Array<{
    questionId: string;
    formFieldId: string;
    valueText?: string | null;
    valueNumeric?: number | null;
    valueBoolean?: boolean | null;
    valueDate?: string | null;
    valueJson?: unknown | null;
  }>;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  filter?: string;
}
