/** Error Handler Middleware
 * @return Promise
 */

import ErrorResponse from '../utils/error.response.js';
import multer from 'multer';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.log(`[Error]---------->: ${error.message}`);
  // Handling specific Multer errors here
  if (err instanceof multer.MulterError) {
    // Handling the specific Multer LIMIT_FILE_SIZE error
    if (err.code === 'LIMIT_FILE_SIZE') {
      const message = 'File too large. Please upload files smaller than 170MB.';
      error = new ErrorResponse(message, 400);
    } else {
      // Handle other Multer errors here (if needed)
      const message = `Multer error: ${err.message}`;
      error = new ErrorResponse(message, 400);
    }
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered ${Object.keys(
      err?.keyValue
    )}`;
    error = new ErrorResponse(message, 400);
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'Reduce file size';
    error = new ErrorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    message: { error: error.message || 'Server Error' },
  });
};

export default errorHandler;
