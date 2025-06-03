class CustomAPIError extends Error {
  constructor(message) {
    super(message);
  }
}

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

const errorHandlerMiddleware = (err, req, res, next) => {
  // Default to 500 if no status code is set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong, please try again later';
  
  // Log the error for debugging
  console.error(err);

  // Send response
  res.status(statusCode).json({ 
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
  errorHandlerMiddleware
};