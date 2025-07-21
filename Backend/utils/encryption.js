// Encryption utilities
const bcrypt = require('bcrypt');

module.exports = {
  // Add your encryption functions here
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },
  comparePassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },
  // Add more encryption helpers as needed
};
