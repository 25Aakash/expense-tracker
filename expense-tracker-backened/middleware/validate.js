module.exports = (schema) => (req, _res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return next({ status: 400, message: error.details[0].message });
  next();
};
