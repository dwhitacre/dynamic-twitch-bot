function execCmd(commandName, state) {
  const command = this.getCmd(commandName);
  if (!command) return; // not a command so do nothing

  this._log(`* execCmd ${commandName}`);
}

module.exports = execCmd;