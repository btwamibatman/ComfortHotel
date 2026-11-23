const config = require('../config/env');

const PRODUCT_REQUEST_TIMEOUT_MS = 2000;

async function listRoomsForView({
  fetchFn = global.fetch,
  timeoutMs = PRODUCT_REQUEST_TIMEOUT_MS,
} = {}) {
  if (!config.productServiceUrl) {
    throw new Error('PRODUCT_SERVICE_URL is required to render room views');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(`${config.productServiceUrl}/api/rooms`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Product service returned ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function sendView(pageName, locals = {}) {
  return async (req, res, next) => {
    try {
      const viewLocals = { ...locals };
      if (pageName === 'rooms' || pageName === 'booking') {
        const rooms = await listRoomsForView();
        viewLocals.rooms = rooms || [];
      }
      res.render(pageName, viewLocals);
    } catch (error) {
      console.error(`Failed to render ${pageName}:`, error);
      next(error);
    }
  };
}

function sendRoomImage(req, res) {
  const path = require('path');
  const { viewsDir } = require('../config/paths');
  const imagePath = path.join(viewsDir, `${req.params.id}.jpg`);
  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(404).send('Image not found');
    }
  });
}

module.exports = {
  listRoomsForView,
  sendView,
  sendRoomImage,
};
