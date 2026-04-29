function writeResultFromInsert(row) {
  return { insertedId: row.id };
}

function writeResultFromUpdate(rowCount) {
  return { matchedCount: rowCount, modifiedCount: rowCount };
}

function writeResultFromDelete(rowCount) {
  return { deletedCount: rowCount };
}

function applyProjection(records, projection) {
  if (!projection) {
    return records;
  }

  return records.map((record) => {
    const projected = { _id: record._id };
    for (const field of Object.keys(projection)) {
      if (Object.prototype.hasOwnProperty.call(record, field)) {
        projected[field] = record[field];
      }
    }
    return projected;
  });
}

function buildOrderBy(sort, allowedColumns, defaultField) {
  const [[field, direction] = [defaultField, -1]] = Object.entries(sort || {});
  const column = allowedColumns[field] || allowedColumns[defaultField];
  return `${column} ${direction === 1 ? 'ASC' : 'DESC'}`;
}

module.exports = {
  writeResultFromInsert,
  writeResultFromUpdate,
  writeResultFromDelete,
  applyProjection,
  buildOrderBy,
};
