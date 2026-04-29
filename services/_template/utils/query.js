function buildListQuery(query, defaultSortField) {
  const sort = {};
  if (query.sortBy) {
    sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort[defaultSortField] = -1;
  }

  let projection;
  if (query.fields) {
    projection = {};
    query.fields.split(',').forEach((field) => {
      const clean = field.trim();
      if (clean) {
        projection[clean] = 1;
      }
    });

    if (Object.keys(projection).length === 0) {
      projection = undefined;
    }
  }

  return { sort, projection };
}

module.exports = {
  buildListQuery,
};
