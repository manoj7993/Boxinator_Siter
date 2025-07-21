// Response helper functions
module.exports = {
  success: (res, data, message = 'Success') => {
    return res.status(200).json({
      success: true,
      message,
      data
    });
  },
  error: (res, statusCode, message = 'Error occurred') => {
    return res.status(statusCode).json({
      success: false,
      message
    });
  },
  // Add more response helpers as needed
};
