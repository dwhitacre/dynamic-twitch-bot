const parseArgs = require('minimist');

async function execCmd(commandName, state) {
  const command = this.getCmd(commandName);
  if (!command) return; // not a command so do nothing

  if (!command.enabled) return; // not enabled

  const args = {};
  const parse = parseArgs(state.rest);
  
  for (let i = 0; i < command.args.length; i++) {
    args[command.args[i]] = parse._[i];
  }

  const flags = {};
  command.flags.forEach(flag => {
    flags[flag] = parse[flag];
  });

  command.validate({
    name: commandName,
    args,
    flags,
    state
  })
    .then(async (valid) => {
      if (!valid) return; // not valid usage, respond with how-to here
      await command.action({
        name: commandName,
        args,
        flags,
        state
      });
    });
}

module.exports = execCmd;