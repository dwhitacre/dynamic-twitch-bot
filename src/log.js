function log(message, enabled = true) {
  if (!enabled) return;
  console.log(message);
}

module.exports = log;