const nodemon = require('nodemon');

nodemon({
  script: 'example/example.js',
  ext: 'js json',
  watch: ['src/**/*', 'dynamic_twitch_bot.js', 'example/example.js']
});

nodemon.on('start', () => {
  console.log('Dynamic twitch bot example has started..');
}).on('quit', () => {
  console.log('Dynamic twitch bot example has quit.');
}).on('restart', files => {
  console.log(`Dynamic twitch bot restarted due to: ${files}`);
});