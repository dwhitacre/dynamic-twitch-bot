const Joi = require('joi');

const { role: schema } = require('./schema');

class Role {
  constructor(options) {
    const { error, value } = Joi.validate(options, schema);
    if (error) throw error;

    this._can = value.can;
    this._inherits = value.inherits;
  }

  getDef() {
    return {
      can: this._can,
      inherits: this._inherits
    };
  }

  get can() {
    return this._can;
  }

  addCan(canName) {
    if (this._can[canName]) return;
    this._can[canName] = 1;
  }

  rmCan(canName) {
    if (!this._can[canName]) return;
    delete this._can[canName];
  }

  get inherits() {
    return this._inherits;
  }

  addInherits(inheritsName) {
    if (this._inherits[inheritsName]) return;
    this._inherits[inheritsName] = 1;
  }

  rmInherits(inheritsName) {
    if (!this._inherits[inheritsName]) return;
    delete this._inherits[inheritsName];
  }
}

module.exports = Role;