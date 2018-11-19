function onConnectedHandler(address, port) {
  this._log(`Connected to ${address}:$(port)`);
}

module.exports = onConnectedHandler;