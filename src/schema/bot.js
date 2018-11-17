const Joi = require('joi');

const username = Joi.string().required();
const token = Joi.string().required();
const channels = Joi.array().items(Joi.string()).single().default([]);
const commandPrefix = Joi.string().default('!');
const channelPrefix = Joi.string().default('#');

const host = Joi.string().default('localhost');
const port = Joi.number().min(1).max(65536).default(3000);

const loggingEnabled = Joi.boolean().default(true);

const twitch = Joi.object().keys({
  username,
  token,
  channels,
  commandPrefix,
  channelPrefix
}).default();

const server = Joi.object().keys({
  host,
  port
}).default();

const bot = Joi.object().keys({
  twitch,
  server
}).default();

module.exports = {
  full: bot,
  twitch: {
    full: twitch,
    username,
    token,
    channels,
    commandPrefix,
    channelPrefix
  },
  server: {
    full: server,
    host,
    port
  },
  loggingEnabled
};