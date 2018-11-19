const Boom = require('boom');
const Joi = require('joi');

const handler = async (request, h, self) => {
  if (!request.payload) return Boom.badRequest('request must have a payload');
  const payload = request.payload;

  self._log(`[${new Date().toISOString()} rest <received>] ${JSON.stringify({ payload, params: request.query })}`);

  const route = self.getRoute(payload.name);
  if (!route) {
    self._log(`Unknown route: ${payload.name}`);
    return Boom.notFound(`request name '${payload.name}' does not exist`);
  }
  if (!route.enabled) {
    self._log(`Route currently disabled: ${route.name}`);
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
    invokeType: 'route',
    args,
    flags,
    Joi,
    Boom,
    self
  });

  const fullResponse = {
    message: response,
    name: payload.name
  }

  self._log(`[${new Date().toISOString()} rest <sent>] ${JSON.stringify(fullResponse)}`);
  return fullResponse;
};

module.exports = handler;