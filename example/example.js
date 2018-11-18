const DynamicTwitchBot = require('../index.js');

const dtBot = new DynamicTwitchBot({
  twitch: {
    username: process.env.TWITCH_USERNAME,
    token: process.env.TWITCH_TOKEN,
    channels: ['mellana']
  }
});

dtBot.init();
dtBot.start()
  .then(() => {
    setTimeout(() => {
      dtBot.stop();
    }, 5 * 60 * 1000);

    dtBot.addCmd({
      name: 'info',
      alias: 'i',
      validate: async ({ name, args, flags, state }) => {
        console.log({ name, args, flags, state});

      }
    });
  });