// Database helper functions
module.exports = {
  // Add your database helper functions here
  handleDbError: (error) => {
    console.error('Database error:', error);
    throw error;
  },
  // Add more database helpers as needed
};
