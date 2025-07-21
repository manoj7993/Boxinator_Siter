/**
 * Rudimentary XSS / SQL-injection prevention.
 * Escapes special HTML chars in string fields of req.body.
 */

const { escape } = require('lodash');

const sanitizeInput = (req, _res, next) => {
  const traverse = (obj) => {
    Object.keys(obj).forEach((key) => {
      const val = obj[key];
      if (typeof val === 'string') obj[key] = escape(val);
      else if (typeof val === 'object' && val !== null) traverse(val);
    });
  };

  if (req.body)  traverse(req.body);
  if (req.query) traverse(req.query);
  if (req.params)traverse(req.params);

  next();
};

module.exports = sanitizeInput;

