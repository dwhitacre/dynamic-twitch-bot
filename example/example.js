const DynamicTwitchBot = require('../index.js');

const dtBot = new DynamicTwitchBot({
  twitch: {
    username: process.env.TWITCH_USERNAME,
    token: process.env.TWITCH_TOKEN,
    channels: ['mellana']
  }
});

console.log('twitchSettings', dtBot.twitchSettings);
console.log('serverSettings', dtBot.serverSettings);
console.log('twitchCommandPrefix', dtBot.getTwitchCommandPrefix());
console.log('twitchChannelPrefix', dtBot.getTwitchChannelPrefix());
console.log('twitchChannels', dtBot.getTwitchChannels());

dtBot.init();
dtBot.start()
  .then(() => {
    console.log('dtBot has started');
  });