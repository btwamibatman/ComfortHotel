function getApiInfo(req, res) {
  res.status(200).json({
    project: 'Comfort Hoetel - Assignment 4',
    description: 'Hotel Booking System with Session-based Authentication',
    version: '2.0.0',
    features: [
      'Session-based authentication',
      'Bcrypt password hashing',
      'HttpOnly & Secure cookies',
      'CRUD operations for bookings',
      'Protected write operations',
    ],
  });
}

module.exports = {
  getApiInfo,
};
