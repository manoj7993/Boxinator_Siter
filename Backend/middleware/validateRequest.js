/**
 * Wraps a Joi schema for quick reuse in routes.
 * Example: router.post('/', validateRequest(schema), controllerFn);
 */

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(
    { body: req.body, params: req.params, query: req.query },
    { abortEarly: false, allowUnknown: true }
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(d => d.message)
    });
  }
  next();
};

module.exports = validateRequest;
