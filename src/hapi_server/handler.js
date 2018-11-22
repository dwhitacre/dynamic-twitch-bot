const Boom = require('boom');
const Joi = require('joi');
const uuid = require('uuid');

const from = 'hapi_handler';
const target = 'rest';

const handler = async (request, h, self) => {
  if (!request.payload) return Boom.badRequest('request must have a payload');
  const payload = request.payload;

  const id = uuid.v1();

  self._log({
    id,
    from,
    target,
    type: 'received',
    message: `${JSON.stringify({ payload, params: request.query })}`
  });

  const route = self.getRoute(payload.name);
  if (!route) {
    self._log({
      id,
      from,
      type: 'internal',
      message: `Unknown route: ${payload.name}`
    });
    return Boom.notFound(`request name '${payload.name}' does not exist`);
  }
  if (!route.enabled) {
    self._log({
      id,
      from,
      type: 'internal',
      message: `Route currently disabled: ${route.name}`
    });
    return Boom.notImplemented(`request name '${route.name}' not currently enabled`);
  }

  const args = {};
  route.args.forEach(arg => {
    args[arg] = payload[arg];
  });

  const flags = {};
  route.flags.forEach(flag => {
    flags[flag] = request.query[flag];
  });

  const response = await route.handler({
    route,
    name: payload.name,
    target,
    messageType: 'route',
    messageRaw: '',
    args,
    flags,
    self
  });

  const fullResponse = {
    message: response,
    name: payload.name
  };

  self._log({
    id,
    from,
    target,
    type: 'sent',
    message: `${JSON.stringify(fullResponse)}`
  });

  return fullResponse;
};

module.exports = handler;