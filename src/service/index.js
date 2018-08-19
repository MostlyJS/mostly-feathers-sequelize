const assert = require('assert')
const fp = require('mostly-func')
const makeDebug = require('debug')
const { Service: BaseService } = require('./base')
const { transform } = require('../helpers')
const { defaultMethods, isAction } = require('mostly-feathers')

const debug = makeDebug('mostly:feathers-sequelize:service:index.js')

// prevent accidental multiple operations
const assertMultiple = function (id, params, message) {
  if (!id) {
    if (params && params.query && (params.$multi || params.query.$multi)) {
      delete params.query.$multi;
    } else {
      throw new Error(message);
    }
  }
}

class Service extends BaseService {
  constructor(options) {
    super(options)
  }

  setup (app) {
    this.app = app
  }

  /**
   * check if name is a service method
   */
  _isAction (id, params) {
    return isAction(this, id, params)
  }

  /**
   * Proxy to a action service
   */
  async _action (method, id, data, params) {
    const action = params && (params.action || (params.query && params.query.$action)) || id;
    assert(action, 'action is not provided');

    if (!fp.isFunction(this[action]) || defaultMethods.indexOf(action) >= 0) {
      throw new Error(`Not implemented **${method}** action: ${action}`);
    }
    params = fp.dissoc('action', fp.dissocPath(['query', '$action'], params));
    debug('service %s %s action %s id %j => %j', this.name, method, action, id, data);

    switch (method) {
      case 'get': return this[action].call(this, params);
      case 'create': return this[action].call(this, null, data, params);
      case 'update': return this[action].call(this, id, data, params);
      case 'patch': return this[action].call(this, id, data, params);
      case 'remove': return this[action].call(this, id, params);
      default: throw new Error(`Invalid method ${method}`);
    }
  }

  get (id, params = {}) {
    params = { query: {}, ...params };
    if (this._isAction(id, params)) {
      return this._action('get', id, null, params);
    }
    debug('service %s get %j', this.name, id, params.query);
    return super.get(id, params).then(transform);
  }

  create (data, params = {}) {
    params = { query: {}, ...params };

    debug('service %s create %j', this.name, data);
    return super.create(data, params).then(transform);
  }

  async update (id, data, params = {}) {
    params = { query: {}, ...params };

    if (this._isAction(id, params)) {
      return this._action('update', id, data, params);
    }
    assertMultiple(id, params, "Found null id, update must be called with $multi.");
    debug('service %s update %j', this.name, id, data);
    return super.update(id, data, params).then(transform);
  }


  async patch (id, data, params = {}) {
    params = { query: {}, ...params };

    if (this._isAction(id, params)) {
      return this._action('patch', id, data, params);
    }
    assertMultiple(id, params, "Found null id, patch must be called with $multi.");
    debug('service %s patch %j', this.name, id, data);
    return super.patch(id, data, params).then(transform);
  }

  async remove (id, params = {}) {
    params = { query: {}, ...params };
    assertMultiple(id, params, "Found null id, remove must be called with $multi.");

    if (this._isAction(id, params)) {
      return this._action('remove', id, null, params);
    }
    const soft = params.$soft || params.query.$soft;
    if (soft !== undefined) {
      params = fp.dissocPath(['query', '$soft'], params); // remove soft
    }
    if (params.query && fp.parseBool(soft)) {
      debug('service %s remove soft %j', this.name, id);
      return super.patch(id, { destroyedAt: new Date() }, params).then(transform);
    } else {
      debug('service %s remove %j', this.name, id);
      return super.remove(id, params).then(transform);
    }
  }

  /**
   * proxy to action method (same code as in mostly-feathers)
   * syntax sugar for calling = require(other services, do not call them by super
   */
  action (action) {
    assert(action, 'action is not provided');
    return {
      find: async (params = {}) => {
        params.action = action;
        return this.get(null, params);
      },

      get: (id, params = {}) => {
        params.action = action;
        return this.get(id, params);
      },

      create: async (data, params = {}) => {
        params.action = action;
        return this.patch(null, data, params);
      },

      update: async (id, data, params = {}) => {
        params.action = action;
        return this.update(id, data, params);
      },

      patch: async (id, data, params = {}) => {
        params.action = action;
        return this.patch(id, data, params);
      },

      remove: async (id, params = {}) => {
        params.action = action;
        return this.remove(id, params);
      }
    }
  }

  async first (params = {}) {
    params = { query: {}, ...params };
    params.query.$limit = 1;
    params.paginate = false; // disable paginate
    
    return super.find(params).then(results => {
      return results && results.length > 0? results[0] : null;
    }).then(transform);
  }

  async find (params) {
    return super.find(params).then(transform)
  }

  async all (params = {}) {
    return this.find({ paginate: false, ...params }).then(transform)
  }
  
  static create (options) {
    debug('create service: ', options)
    return new Service(options)
  }
}

module.exports = Service.create
module.exports.Service = Service