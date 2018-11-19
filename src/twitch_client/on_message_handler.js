const Joi = require('joi');
const Boom = require('boom');
const parseArgs = require('minimist');

async function onMessageHandler(target, userstate, message, selfMessage) {
  if (selfMessage) return;

  this._log(`[${new Date().toISOString()} ${target} (${userstate['message-type']}) <received>] ${userstate.username}: ${message}`);

  if (message.substring(0, 1) !== this.getSettings().commandPrefix) return;

  const parse = message.slice(1).split(' ');
  const commandName = parse[0];

  const command = this.getCommand(commandName);
  if (!command) {
    this._log(`Unknown command: ${commandName}`);
    return;
  }
  if (!command.enabled) {
    this._log(`Command currently disabled: ${command.name}`);
    return;
  }

  const rest = parseArgs(parse.splice(1));

  const args = {};
  if (command.args.length > 0) {
    let i = 0;
    for (i = 0; i < command.args.length - 1; i++) {
      args[command.args[i]] = rest['_'][i];
    }
    args[command.args[i]] = rest['_'].join(' ');
  }

  const flags = {};
  command.flags.forEach(flag => {
    flags[flag] = rest[flag];
  });

  const response = await command.handler({
    command,
    name: command.name,
    invokeType: 'command',
    target,
    messageType: userstate['message-type'],
    messageRaw: message,
    args,
    flags,
    Joi,
    Boom,
    self: this
  });

  if (response) this.say(target, userstate['message-type'], response); 
}

module.exports = onMessageHandler;