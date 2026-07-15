
export const getPaginationArgs = (page: number = 1, limit: number = 10) => {
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;
  return { take, skip };
};

export const getPaginatedMeta = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
};
