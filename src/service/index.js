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
  
  unwrapList (result) {
    return (result && result.data) ? result.data : []
  }

  async findOne (condition) {
    const query = { where: condition, $limit: 1 }
    const result = this.unwrapList(await this.find(query))
    return result && result.length ? result[0] : undefined
  }

  async findNaked (condition) {
    return this.unwrapList(await this.find(condition))
  }

  async findAllNaked () {
    return this.findNaked({ $limit: this.paginate.max || 100 })
  }
  
  static create (options) {
    debug('create service: ', options)
    return new Service(options)
  }
}

module.exports = Service.create
module.exports.Service = Service