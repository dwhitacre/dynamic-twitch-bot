require('./handle_sigint');

const DynamicTwitchBot = require('../dynamic_twitch_bot.js');

const dtBot = new DynamicTwitchBot({
  twitchClient: {
    username: process.env.TWITCH_USERNAME,
    token: process.env.TWITCH_TOKEN,
    channels: ['danonthemoon']
  }
});

dtBot.init();
dtBot.addRule({
  name: 'echo',
  aliases: 'e',
  args: 'message',
  handler: async (params) => {
    return params.args.message;
  }
});
dtBot.start();