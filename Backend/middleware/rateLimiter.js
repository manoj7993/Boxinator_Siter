/**
 * Global and auth-specific rate limiting.
 */

const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,          // 15 min window
  max: 100,                          // 100 requests / IP
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,          // tighter window for auth
  max: 5,                            // 5 login/registration attempts
  message: 'Too many attempts, try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  authLimiter
};
