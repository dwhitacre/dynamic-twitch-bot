async function execCmd(commandName, state) {
  const command = this.getCmd(commandName);
  if (!command) return; // not a command so do nothing

  command.validate(state)
    .then(async () => {
      await command.action(state);
    });
}

module.exports = execCmd;