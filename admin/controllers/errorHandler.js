const handleErrors = (res, error) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(error.errors).map(err => err.message)
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry'
    });
  }

  // Erreurs MongoDB
  if (error.name === 'MongoError') {
    return res.status(500).json({
      error: 'Database Error',
      details: error.message
    });
  }

  // Erreurs JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired'
    });
  }

  // Erreurs générales
  res.status(500).json({
    error: 'Internal Server Error',
    details: error.message
  });
};

module.exports = {
  handleErrors
};
