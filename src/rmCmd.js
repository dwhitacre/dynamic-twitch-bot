function rmCmd(commandName) {
  const command = this.getCmd(commandName);
  if (!command) return; // not a command so do nothing

  this._commands = this._commands.filter(c => {
    return c.name !== command.name;
  });
}

module.exports = rmCmd;