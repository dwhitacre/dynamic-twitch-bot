const Joi = require('joi');

const roleName = Joi.string().alphanum().max(500).required();
const userName = Joi.string().alphanum().max(500).required();

const logEnabled = Joi.boolean().default(true);

const rbac = Joi.object().keys({
  logEnabled
}).default();

const can = Joi.object().default({});
const inherits = Joi.object().default({});

const role = Joi.object().keys({
  can,
  inherits
}).default();

const user = Joi.object().keys({
  name: userName,
  role: roleName
});

module.exports = { rbac, role, user, userName, roleName };