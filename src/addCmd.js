const Joi = require('joi');

const {
  command: commandSchema
} = require('./schema/schema');

function addCmd(command) {
  const { error, value } = Joi.validate(command, commandSchema.full);
  if (error) throw error;

  if (this.getCmd(value.name)) throw new Error(`Command ${value.name} already exists`);
  value.alias.forEach(a => {
    if (this.getCmd(a)) throw new Error(`Command ${a} alread exists`);
  });

  this._commands.push(value);
}

module.exports = addCmd;