const assert = require('assert')
const makeDebug = require('debug')
const { Service: BaseService } = require('./base')

const debug = makeDebug('mostly:feathers-sequelize:service:index.js')

class Service extends BaseService {
  constructor(options) {
    super(options)
  }

  setup (app) {
    this.app = app;
  }
  
  static create (options) {
    debug('create service: ', options)
    return new Service(options)
  }
}

module.exports = Service.create
module.exports.Service = Service