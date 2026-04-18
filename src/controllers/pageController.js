function sendView(pageName, locals = {}) {
  return (req, res) => {
    res.render(pageName, locals);
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
