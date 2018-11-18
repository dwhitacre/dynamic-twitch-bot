const Joi = require('joi');

const {
  command: commandSchema
} = require('./schema/schema');

function editCmd(commandName, edits) {
  const command = this.getCmd(commandName);
  if (!command) return; // not a command so do nothing

  const newCommand = {
    ...command,
    ...edits
  };

  const { error, value } = Joi.validate(newCommand, commandSchema.full);
  if (error) throw error;

  this.rmCmd(value.name);
  this.addCmd(value);
}

module.exports = editCmd;