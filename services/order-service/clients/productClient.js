const config = require('../config/env');

const ROOM_CACHE_TTL_MS = 30 * 1000;
const PRODUCT_REQUEST_TIMEOUT_MS = 2000;
const roomCache = new Map();

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PRODUCT_REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function getRoomByType(roomType) {
  const encodedType = encodeURIComponent(roomType.trim().toLowerCase());
  const cached = roomCache.get(encodedType);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.room;
  }

  const response = await fetchWithTimeout(`${config.productServiceUrl}/api/rooms/type/${encodedType}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Product service returned ${response.status}`);
  }

  const room = await response.json();
  roomCache.set(encodedType, {
    room,
    expiresAt: Date.now() + ROOM_CACHE_TTL_MS,
  });

  return room;
}

module.exports = {
  getRoomByType,
};
