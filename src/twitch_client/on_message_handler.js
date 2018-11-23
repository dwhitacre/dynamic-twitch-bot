const Joi = require('joi');
const Boom = require('boom');
const parseArgs = require('minimist');
const uuid = require('uuid');

const from = 'twitch_handler';

async function onMessageHandler(target, userstate, message, selfMessage) {
  if (selfMessage) return;
  if (userstate['message-type'] === 'action') return;

  const id = uuid.v1();

  this._log({
    id,
    from,
    target,
    type: `${userstate['message-type']}_received`,
    message,
    username: userstate.username
  });

  if (message.substring(0, 1) !== this.getSettings().commandPrefix) return;

  const parse = message.slice(1).split(' ');
  const commandName = parse[0];

  const command = this.getCommand(commandName);
  if (!command) {
    this._log({
      id,
      from,
      type: 'internal',
      message: `Unknown command: ${commandName}`
    });
    return;
  }
  if (!command.enabled) {
    this._log({
      id,
      from,
      type: 'internal',
      message: `Command currently disabled: ${command.name}`
    });
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
    target,
    messageType: userstate['message-type'],
    messageRaw: message,
    args,
    flags,
    bot: this._parent
  });

  this._log({
    id,
    from,
    target,
    type: `${userstate['message-type']}_sent`,
    message: response,
    username: userstate.username
  });

  if (response) this.say(target, userstate['message-type'], response); 
}

module.exports = onMessageHandler;