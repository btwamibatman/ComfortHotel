const config = require('../config/env');

async function listRoomsForView() {
  if (!config.productServiceUrl) {
    throw new Error('PRODUCT_SERVICE_URL is required to render room views');
  }

  const response = await fetch(`${config.productServiceUrl}/api/rooms`);
  if (!response.ok) {
    throw new Error(`Product service returned ${response.status}`);
  }

  return response.json();
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
  sendView,
  sendRoomImage,
};
