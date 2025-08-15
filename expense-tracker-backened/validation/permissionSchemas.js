const Joi = require('joi');

const PERM_KEYS = [
  'canAdd',
  'canEdit',
  'canDelete',
  'canViewTeam',
  'canManageUsers',
  'canExport',
  'canAccessReports',
];

exports.permissions = Joi.object(
  Object.fromEntries(PERM_KEYS.map((k) => [k, Joi.boolean().required()]))
);

exports.addUserUnderManager = Joi.object({
  name:     Joi.string().min(1).required(),
  email:    Joi.string().email().required(),
  mobile:   Joi.string().pattern(/^\d{10}$/).required(),
  password: Joi.string().min(8).required(),
  permissions: exports.permissions.required(),
});
