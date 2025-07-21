/**
 * Centralised error handler.
 * Add as the FINAL .use() call inside app.js
 */
/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  console.error(err);                        // server-side logging

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
/* eslint-enable no-unused-vars */

module.exports = errorHandler;
