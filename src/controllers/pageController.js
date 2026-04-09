const path = require('path');
const { viewsDir } = require('../config/paths');

function sendView(pageName) {
  return (req, res) => {
    res.sendFile(path.join(viewsDir, pageName));
  };
}

function sendRoomImage(req, res) {
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
