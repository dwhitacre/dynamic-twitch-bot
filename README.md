> THIS REPO IS DEPRECATED IN FAVOR OF [EASY-TWITCH-BOT](https://github.com/dwhitacre/easy-twitch-bot)

# dynamic-twitch-bot

Dynamically customizable twitch IRC bot. Generate twitch IRC CLI and API from rule definitions.

### Road to 1.0

This is very much in progress and subject to change at the moment. From here on out I will do my best not to break functionality across minor versions, but no promises. Future known implementation plans are below.

- [x] twitch and hapi services
- [x] rules
- [x] node api for configuring twitch, hapi, rules
- [x] refactor, reswizzle
- [x] basic test coverage
- [x] dynamically build API and CLI from rules
- [x] cleanup and standardize handlers
- [ ] better test coverage
- [x] better logging
- [ ] helper functions on top of existing API
- [ ] extend CLI
- [ ] extend API
- [ ] basic storage
- [x] add RBAC
- [ ] add persistent storage

### How-to

`npm i`

At the moment see `dynamic_twitch_bot.js` for the public API, will add doc later.

### Config

Subject to change, but at the moment feel its relatively stable. Until I get the time to write the doc, see code.

### Contributing

Best way to contact me is on [twitch](https://twitch.tv/danonthemoon) or on discord (danonthemoon#3426). If you wish to contribute, please contact me first. We will get an issue for you to work on and your dev env setup.

`npm start` runs `example/watch.js` watching the src code for changes. It just starts up a basic example of the bot.

`npm run test` to run the tests.

