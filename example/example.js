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
  storageManager: {
    defaultStorage: 'memory'
  }
  //rbac: { enabled: false }
});

dtBot.init();
dtBot.rbac.addRole('admin', {
  can: ['echo'],
  inherits: ['default']
});
dtBot.rbac.addRole('default', {
  can: [ 'e', 'devmoon', 'devearth', 'devdan' ]
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

dtBot.storageManager.add('moonStorage');
const moonStorage = dtBot.storageManager.get('moonStorage');
moonStorage.init()
  .then(async (success) => {
    if (!success) throw new Error('could not init moonStorage');

    await moonStorage.add('members', []);

    dtBot.addRule({
      name: 'devmoon',
      handler: async (params) => {
        const bot = params.bot;
        const storageManager = bot.storageManager;
        const mS = storageManager.get('moonStorage');
        
        let msMembers = await mS.get('members');

        const index = msMembers.indexOf(params.username);
        if (index > -1) {
          return `@${params.username}, you are already on the moon :)`;
        }

        if (!params.username) return 'need to have a username to join the moon';

        msMembers.push(params.username);
        const success = await mS.edit('members', msMembers);
        
        if (!success) return `@${params.username} failed to make it to the moon! Try again!`;
        return `@${params.username}, welcome to the moon!`;
      }
    });
    dtBot.addRule({
      name: 'devearth',
      handler: async (params) => {
        const bot = params.bot;
        const storageManager = bot.storageManager;
        const mS = storageManager.get('moonStorage');

        const msMembers = await mS.get('members');
        const index = msMembers.indexOf(params.username);
        if (index > -1) {
          msMembers.splice(index, 1);
          const success = await mS.edit('members', msMembers);
        
          if (!success) return `@${params.username} failed to leave the moon! Try again!`;
          return `@${params.username}, came back down to earth :(`;
        }

        if (!params.username) return 'need to have a username to be on earth';

        return `@${params.username}, you are already on the earth...`;
      }
    });
    dtBot.addRule({
      name: 'devdan',
      handler: async (params) => {
        const bot = params.bot;
        const storageManager = bot.storageManager;
        const mS = storageManager.get('moonStorage');

        const msMembers = await mS.get('members');

        return `Heres the current moon party: ${msMembers.join(', ')}`;
      }
    });
  });

dtBot.start();