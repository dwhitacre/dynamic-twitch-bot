const Joi = require('joi');
const Hapi = require('hapi');
const tmi = require('tmi.js');

const {
  bot: botSchema
} = require('./src/schema/schema');

const log = require('./src/log');

const addCmd = require('./src/addCmd');
const clearCmd = require('./src/clearCmd');
const editCmd = require('./src/editCmd');
const execCmd = require('./src/execCmd');
const getCmd = require('./src/getCmd');
const rmCmd = require('./src/rmCmd');

class DynamicTwitchBot {
  constructor(config) {
    const { error, value } = Joi.validate(config, botSchema.full);
    if (error) throw error;

    this._config = value;
    this._serverRunning = false;
    this._dirtyConfig = true;
    this._commands = [];
  }

  get twitchSettings() {
    return this._config.twitch;
  }

  set twitchSettings(twitch) {
    if (this._serverRunning) throw new Error('Cannot modify twitch settings whilst server is running.');

    const { error, value } = Joi.validate(twitch, botSchema.twitch.full);
    if (error) throw error;

    this._config.twitch = value;
    this._dirtyConfig = true;
  }

  get serverSettings() {
    return this._config.server;
  }

  set serverSettings(server) {
    if (this._serverRunning) throw new Error('Cannot modify server settings whilst server is running.');

    const { error, value } = Joi.validate(server, botSchema.server.full);
    if (error) throw error;

    this._config.server = value;
    this._dirtyConfig = true;
  }

  getTwitchChannels() {
    return this._config.twitch.channels;
  }

  setTwitchChannels(channels) {
    if (this._serverRunning) throw new Error('Cannot modify channels whilst server is running.');

    const { error, value } = Joi.validate(channels, botSchema.twitch.channels);
    if (error) throw error;

    this._config.twitch.channels = value;
    this._dirtyConfig = true;
  }

  getTwitchCommandPrefix() {
    return this._config.twitch.commandPrefix;
  }

  setTwitchCommandPrefix(prefix) {
    const { error, value } = Joi.validate(prefix, botSchema.twitch.commandPrefix);
    if (error) throw error;

    this._config.twitch.commandPrefix = value;
  }

  getTwitchChannelPrefix() {
    return this._config.twitch.channelPrefix;
  }

  setTwitchChannelPrefix(prefix) {
    const { error, value } = Joi.validate(prefix, botSchema.twitch.channelPrefix);
    if (error) throw error;

    this._config.twitch.channelPrefix = value;
  }

  getLogging() {
    return this._config.loggingEnabled;
  }

  setLogging(enabled = true) {
    const { error, value } = Joi.validate(enabled, botSchema.loggingEnabled);
    if (error) throw error;

    this._config.loggingEnabled = enabled;
  }

  _log(message) {
    log(message, this._config.loggingEnabled);
  }

  async _onMessageHandler(target, userstate, message, self) {
    if (self) return;

    this._log(`[${new Date().toISOString()} ${target} (${userstate['message-type']})] ${userstate.username}: ${message}`);

    if (message.substring(0, 1) !== this._config.twitch.commandPrefix) return;

    const parse = message.slice(1).split(' ');
    const commandName = parse[0];
    const rest = parse.splice(1).join(' ');
    const command = this.getCmd(commandName);

    if (command) {
      this._log(`* Execute command '${commandName}' by ${userstate.username}`);
      await this.execCmd(command, {
        commandName,
        target,
        userstate,
        rawMessage: message,
        rest
      });
    } else {
      this._log(`* Unknown command '${commandName}' from ${userstate.username}`);
    }
  }

  _onConnectedHandler(address, port) {
    this._log(`* Connected to ${address}:${port}`);
  }

  _onDisconnectedHandler(reason) {
    this._log(`* Disconnected for: ${reason}`);
  }

  init() {
    if (!this._dirtyConfig) return; // config isnt dirty so don't need to do anything

    this._server = Hapi.server({
      port: this._config.server.port,
      host: this._config.server.host
    });

    this._twitchClient = tmi.client({
      identity: {
        username: this._config.twitch.username,
        password: this._config.twitch.token
      },
      channels: this._config.twitch.channels,
      connection: {
        reconnect: true
      }
    });

    this._twitchClient.on('connected', this._onConnectedHandler.bind(this));
    this._twitchClient.on('disconnected', this._onDisconnectedHandler.bind(this));
    this._twitchClient.on('message', this._onMessageHandler.bind(this));

    this._dirtyConfig = false;
  }

  async stop() {
    if (!this._serverRunning) return; // server not running do nothing

    async function stopClient() {
      await this._twitchClient.disconnect();
    }

    async function stopServer() {
      await this._server.stop();
      this._log(`* Server stopped running.`);
    }

    await Promise.all([ stopClient.bind(this)(), stopServer.bind(this)() ]);

    this._serverRunning = false;
  }

  async start() {
    if (this._serverRunning) return; // server already running do nothing
    if (this._dirtyConfig) throw new Error('Must run init first and after config has been updated.');
    this._serverRunning = true;

    async function startServer() {
      await this._server.start();
      this._log(`* Server running at: ${this._server.info.uri}..`);
    }

    async function startClient() {
      await this._twitchClient.connect();
    }

    await Promise.all([ startServer.bind(this)(), startClient.bind(this)() ]);
  }

  addCmd(command) {
    return addCmd.bind(this)(command);
  }

  rmCmd(commandName) {
    if (typeof commandName === 'object') commandName = commandName.name;
    return rmCmd.bind(this)(commandName);
  }

  editCmd(commandName, edits) {
    if (typeof commandName === 'object') commandName = commandName.name;
    return editCmd.bind(this)(commandName, edits);
  }

  clearCmd() {
    return clearCmd.bind(this)();
  }

  async execCmd(commandName, state) {
    if (typeof commandName === 'object') commandName = commandName.name;
    return execCmd.bind(this)(commandName, state);
  }

  getCmd(commandName) {
    return getCmd.bind(this)(commandName);
  }
}

module.exports = DynamicTwitchBot;