function onDisconnectedHandler(reason) {
  this._log(`Disonnected for: ${reason}`);
}

module.exports = onDisconnectedHandler;