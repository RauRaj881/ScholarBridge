const visibleStatuses = ["active"];

export function buildVisibleScholarshipQuery(extraQuery = {}) {
  const visibilityFilter = {
    isLive: { $ne: false },
    status: { $in: visibleStatuses },
  };

  if (!extraQuery || Object.keys(extraQuery).length === 0) {
    return visibilityFilter;
  }

  return {
    $and: [visibilityFilter, extraQuery],
  };
}
