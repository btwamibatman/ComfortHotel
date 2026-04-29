const config = require('../config/env');

async function getRoomByType(roomType) {
  const encodedType = encodeURIComponent(roomType.trim().toLowerCase());
  const response = await fetch(`${config.productServiceUrl}/api/rooms/type/${encodedType}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Product service returned ${response.status}`);
  }

  return response.json();
}

module.exports = {
  getRoomByType,
};
