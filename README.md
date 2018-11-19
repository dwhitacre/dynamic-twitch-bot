# dynamic-twitch-bot

Dynamically customizable twitch IRC bot. Generate twitch IRC CLI and API from rule definitions.

### Status

This is very much in progress and subject to change at the moment. From here on out I will do my best not to break functionality across minor versions, but no promises. Future known implementation plans are below.

#### 0.1.x

- [x] twitch and hapi services
- [x] rules
- [x] node api for configuring twitch, hapi, rules

#### 0.2.x

- [x] refactor, reswizzle
- [x] basic test coverage
- [x] dynamically build API and CLI from rules
- [ ] better test coverage

#### 0.x

- [ ] helper functions on top of existing API
- [ ] extend CLI
- [ ] extend API

#### 1.0.x

- [ ] add RBAC

#### 2.0.x

- [ ] add persistent storage

#### x.x.x

- [ ] ?

### How-to

`npm i`

At the moment see `dynamic_twitch_bot.js` for the public API, will add doc later.

### Config

Subject to change, but at the moment feel its relatively stable. Until I get the time to write the doc, see code.

### Contributing

Best way to contact me is on [twitch](https://twitch.tv/danonthemoon). If you wish to contribute, please either open an issue or contact me first.

`npm start` runs `example/example.js` which is the most basic version of this impl.

