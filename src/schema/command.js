const Joi = require('joi');

const name = Joi.string().alphanum().max(500).required();
const alias = Joi.array().items(Joi.string().alphanum().max(500)).max(50).single().default([]);
const enabled = Joi.boolean().default(true);
const args = Joi.array().items(Joi.string().alphanum().max(50)).max(50).single().default([]);
const flags = Joi.array().items(Joi.string().alphanum().max(50)).max(50).single().default([]);
const validate = Joi.func().arity(1).default(async function (args) {
  return true;
});
const action = Joi.func().arity(1).default(async function (args) {
  return;
});

const cmd = Joi.object().keys({
  name,
  alias,
  enabled,
  args,
  flags,
  validate,
  action
});

module.exports = {
  full: cmd,
  name,
  alias,
  enabled,
  args,
  flags,
  validate,
  action
};