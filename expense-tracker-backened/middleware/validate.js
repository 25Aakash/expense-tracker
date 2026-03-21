module.exports = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return next({ status: 400, message: error.details[0].message });
  req.body = value;
  next();
};
