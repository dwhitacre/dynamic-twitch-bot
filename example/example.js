const DynamicTwitchBot = require('../index.js');

const dtBot = new DynamicTwitchBot({
  twitch: {
    username: process.env.TWITCH_USERNAME,
    token: process.env.TWITCH_TOKEN,
    channels: ['rocketleague']
  }
});

dtBot.init();
dtBot.start()
  .then(() => {
    setTimeout(() => {
      dtBot.stop();
    }, 5 * 60 * 1000);

    dtBot.addCmd({});
  });