function getCmd(commandName) {
  let found;
  this._commands.some(command => {
    if (command.name === commandName) {
      found = command;
      return true;
    } else if (command.alias.indexOf(commandName) > -1) {
      found = command;
      return true;
    }
    return false;
  });
  return found;
}

module.exports = getCmd;