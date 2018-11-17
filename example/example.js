const DynamicTwitchBot = require('../index.js');

const dtBot = new DynamicTwitchBot({
  twitch: {
    username: process.env.TWITCH_USERNAME,
    token: process.env.TWITCH_TOKEN,
    channels: ['c3mush']
  }
});

dtBot.init();
dtBot.start();