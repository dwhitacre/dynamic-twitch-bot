/*
 * Although this code is an example of how to get started using
 * this bot framework, it is not an example of what to impl
 * in production code.
 *
 * DO NOT USE IN PRODUCTION!
 * 
 */

require('./handle_sigint');

const DynamicTwitchBot = require('../dynamic_twitch_bot.js');

const dtBot = new DynamicTwitchBot({
  twitchClient: {
    username: process.env.TWITCH_USERNAME,
    token: process.env.TWITCH_TOKEN,
    channels: ['danonthemoon']
  },
  //rbac: { enabled: false }
});

dtBot.init();
dtBot.rbac.addRole('admin', {
  can: ['echo'],
  inherits: ['default']
});
dtBot.rbac.addRole('default', {
  can: [ 'e' ]
});
dtBot.rbac.addUser('danonthemoon', 'admin');
dtBot.addRule({
  name: 'echo',
  aliases: 'e',
  args: 'message',
  handler: async (params) => {
    // needs user message sanitization!
    return params.args.message;
  }
});
dtBot.start();