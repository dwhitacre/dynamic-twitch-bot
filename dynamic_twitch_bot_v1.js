const Joi = require('joi');
const Hapi = require('hapi');
const tmi = require('tmi.js');
const parseArgs = require('minimist');

const {
  bot: botSchema,
  command: commandSchema
} = require('./src/schema/schema');

const log = require('./src/log');

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
    const command = this.getCmd(commandName);
    
    if (command) {
      this._log(`* Execute command '${commandName}' by ${userstate.username}`);

      const rest = parseArgs(parse.splice(1));

      const args = {};
      for (let i = 0; i < command.args.length; i++) {
        args[command.args[i]] = rest['_'][i];
      }

      const flags = {};
      command.flags.forEach(flag => {
        flags[flag] = rest[flag];
      });

      this.execCmd(command, {
        args,
        flags,
        target,
        userstate,
        message,
        restRaw: parse.splice(1).join(' '),
        Joi,
        self: this
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
    const { error, value } = Joi.validate(command, commandSchema.full);
    if (error) throw error;

    if (this.getCmd(value.name)) throw new Error(`Command ${value.name} already exists`);
    value.alias.forEach(a => {
      if (this.getCmd(a)) throw new Error(`Command ${a} already exists`);
    });

    this._commands.push(value);
  }

  rmCmd(command) {
    if (typeof command !== 'object') command = this.getCmd(command);

    if (!command) return; // no command, do nothing

    this._commands = this._commands.filter(c => {
      return c.name !== command.name;
    });
  }

  editCmd(command, edits) {
    if (typeof command !== 'object') command = this.getCmd(command);
    
    if (!command) return; // no command, do nothing

    const newCommand = {
      ...command,
      ...edits
    };

    const { error, value } = Joi.validate(newCommand, commandSchema.full);
    if (error) throw error;

    this.rmCmd(value.name);
    this.addCmd(value);
  }

  clearCmd() {
    this._commands = [];
  }

  async execCmd(command, state) {
    if (typeof command !== 'object') command = this.getCmd(command);

    if (!command) return; // not a command, do nothing
    if (!command.enabled) return;

    async function actionCmd(command, state) {
      return command.action(command, state);
    }

    const boundActionCmd = actionCmd.bind(this);

    return command.validate(command, state)
      .then(({ valid, reason }) => {
        if (!valid) throw reason;
        return boundActionCmd(command, state);
      });
  }

  getCmd(commandName) {
    let found;

    this._commands.some(command => {
      if (command.name === commandName) {
        found = command;
        return true;
      } else if (command.alias.indexOf(commandName) > -1) {
        found = command;
        return true;
      }
      return false;
    });

    return found;
  }

  async speak(target, type, message) {
    if (type === 'chat') {
      return this.say(target, message);
    }
    if (type === 'whisper') {
      return this.whisper(target, message);
    }
    if (type === 'me') {
      return this.me(target, message);
    }
    return this._log(`* spoke to noone, ${target}: ${message}`);
  }

  async say(channel, message) {
    if (!this._serverRunning) return; // server not running do nothing

    if (this.getTwitchChannels().indexOf(channel) <= -1) return; // dont send messages to unknown channels 

    await this._twitchClient.say(channel, message);
  }

  async whisper(username, message) {
    if (!this._serverRunning) return; // server not running do nothing

    await this._twitchClient.whisper(username, message);
  }

  async me(channel, message) {
    if (!this._serverRunning) return; // server not running do nothing

    if (this.getTwitchChannels().indexOf(channel) <= -1) return; // dont send messages to unknown channels 

    await this._twitchClient.action(channel, `/me ${message}`);
  }
}

module.exports = DynamicTwitchBot;